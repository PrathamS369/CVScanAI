# CVScanAI - AI-Powered Resume Scanner

An intelligent resume scanning system that analyzes resumes, extracts structured data, and ranks them based on ATS (Applicant Tracking System) compatibility with job descriptions.

## Features
- Resume parsing (PDF/DOCX)
- Structured data extraction (name, skills, experience)
- Bulk resume processing via ZIP upload
- ATS scoring based on job description similarity
- Dashboard with single/bulk upload options

## Tech Stack
**Frontend**:
- React + Vite
- Tailwind CSS
- react-dropzone

**Backend**:
- Flask (Python)
- spaCy (NLP)
- scikit-learn (TF-IDF + Cosine Similarity)
- pdfplumber (PDF parsing)
- python-docx (DOCX parsing)

## Prerequisites
- Node.js v16+ (for frontend)
- Python 3.8+ (for backend)
- npm (comes with Node.js)
- pip (comes with Python)

## Installation

### Frontend Setup
1. Navigate to frontend directory:
```bash
cd frontend
```
## Installation and Setup

### Frontend Setup

#### Install Dependencies
Run the following command inside the `frontend` directory:

```bash
npm install
```

#### Dependencies Installed:
- `react`
- `react-dom`
- `react-dropzone`
- `axios`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `vite`

### Backend Setup

#### Create and Activate Virtual Environment
Run the following commands in the `backend` directory:

```bash
python -m venv venv
source venv/bin/activate  # For Linux/MacOS
venv\Scripts\activate     # For Windows
```

#### Install Python Dependencies
Ensure all necessary Python dependencies are installed:

```bash
pip install -r requirements.txt
```

**`requirements.txt` includes:**
- `flask`
- `flask-cors`
- `pdfplumber`
- `python-docx`
- `spacy`
- `scikit-learn`
- `python-dotenv`
- `zipfile36`
- `shutil`

#### Download spaCy English Model

```bash
python -m spacy download en_core_web_sm
```

## Running the Project

### Start Backend
From the `backend` directory:

```bash
python app.py
```

### Start Frontend
From the `frontend` directory:

```bash
npm run dev
```

## Project Structure
```
project_root/
│── frontend/       # React frontend
│── backend/        # Flask backend
│── README.md       # Documentation
│── requirements.txt # Backend dependencies
```

## License
This project is licensed under the MIT License.

## Contributing
Feel free to submit issues and pull requests to improve the application.

