from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import docx
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
import zipfile
import shutil

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})  # Allow frontend access

nlp = spacy.load("en_core_web_sm")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text.strip()

# Function to extract text from DOCX
def extract_text_from_docx(docx_path):
    doc = docx.Document(docx_path)
    return "\n".join([para.text for para in doc.paragraphs])

# Function to extract structured data from text
def extract_structured_data(text):
    doc = nlp(text)
    data = {
        "name": None,
        "skills": [],
        "experience": [],
        "education": [],
    }

    # Extract name (assume the first PERSON entity is the name)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            data["name"] = ent.text
            break

    # Extract skills (custom logic or use a predefined skills list)
    skills_list = ["Python", "JavaScript", "Flask", "React", "Machine Learning"]
    for token in doc:
        if token.text in skills_list:
            data["skills"].append(token.text)

    # Extract experience and education (custom logic)
    for sent in doc.sents:
        if "experience" in sent.text.lower():
            data["experience"].append(sent.text)
        if "education" in sent.text.lower():
            data["education"].append(sent.text)

    return data

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return "No file uploaded", 400

    file = request.files["file"]
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    # Extract text
    if file.filename.endswith(".pdf"):
        text = extract_text_from_pdf(filepath)
    elif file.filename.endswith(".docx"):
        text = extract_text_from_docx(filepath)
    else:
        return "Invalid file type", 400

    # Extract structured data
    structured_data = extract_structured_data(text)

    # Return structured data as JSON
    return jsonify(structured_data), 200

@app.route("/upload-zip", methods=["POST"])
def upload_zip():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    zip_file = request.files["file"]
    if not zip_file.filename.endswith(".zip"):
        return jsonify({"error": "Invalid file type. Please upload a zip file."}), 400

    try:
        # Save the zip file
        zip_path = os.path.join(app.config["UPLOAD_FOLDER"], zip_file.filename)
        zip_file.save(zip_path)

        # Extract the zip file
        extract_folder = os.path.join(app.config["UPLOAD_FOLDER"], "extracted")
        os.makedirs(extract_folder, exist_ok=True)
        
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(extract_folder)

        # Process each resume in the extracted folder
        resumes = []
        for root, dirs, files in os.walk(extract_folder):
            for filename in files:
                filepath = os.path.join(root, filename)
                if filename.endswith(".pdf"):
                    text = extract_text_from_pdf(filepath)
                elif filename.endswith(".docx"):
                    text = extract_text_from_docx(filepath)
                else:
                    continue  # Skip non-resume files

                resumes.append({"filename": filename, "content": text})

        if not resumes:
            return jsonify({"error": "No valid resumes found in the ZIP file."}), 400

        return jsonify({"resumes": resumes}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Cleanup: Remove the extracted folder and ZIP file
        if os.path.exists(extract_folder):
            shutil.rmtree(extract_folder)
        if os.path.exists(zip_path):
            os.remove(zip_path)

# Function to calculate similarity
def calculate_similarity(resume_text, job_description):
    documents = [resume_text, job_description]
    vectorizer = TfidfVectorizer().fit_transform(documents)
    vectors = vectorizer.toarray()
    similarity_score = cosine_similarity([vectors[0]], [vectors[1]])[0][0]
    return round(similarity_score * 100, 2)  # Percentage match

@app.route("/rank", methods=["POST"])
def rank_resumes():
    data = request.json
    job_description = data.get("job_description")
    resumes = data.get("resumes", [])

    ranked_resumes = [
        {"filename": r["filename"], "score": calculate_similarity(r["content"], job_description)}
        for r in resumes
    ]
    ranked_resumes.sort(key=lambda x: x["score"], reverse=True)
    
    return jsonify({"ranked_resumes": ranked_resumes})

if __name__ == "__main__":
    app.run(debug=True)