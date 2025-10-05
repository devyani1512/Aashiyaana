import os
import faiss
import numpy as np
import tiktoken
import PyPDF2
import openai
from dotenv import load_dotenv

# ======================
# CONFIGURATION
# ======================
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

PDF_PATH = "evaluation habitat (2).pdf"
CHUNK_SIZE = 500
EMBED_MODEL = "text-embedding-3-small"

# ======================
# PDF TEXT EXTRACTION
# ======================
def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

# ======================
# SPLIT TEXT INTO CHUNKS
# ======================
def split_text(text, chunk_size=CHUNK_SIZE):
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    chunks = []
    for i in range(0, len(tokens), chunk_size):
        chunk_tokens = tokens[i:i+chunk_size]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
    return chunks

# ======================
# EMBEDDING
# ======================
def get_embedding(text):
    resp = openai.Embedding.create(
        input=text,
        model=EMBED_MODEL
    )
    return np.array(resp['data'][0]['embedding'], dtype=np.float32)

# ======================
# INITIALIZE FAISS INDEX
# ======================
def build_faiss_index():
    print("Extracting text from PDF...")
    pdf_text = extract_text_from_pdf(PDF_PATH)
    chunks = split_text(pdf_text)

    embedding_dim = 1536
    index = faiss.IndexFlatL2(embedding_dim)

    print("Creating embeddings for PDF chunks...")
    chunk_embeddings = [get_embedding(c) for c in chunks]
    index.add(np.array(chunk_embeddings))

    print(f"✅ Loaded {len(chunks)} chunks into FAISS index.")
    return index, chunks

# Build once on import
index, chunks = build_faiss_index()

# ======================
# RETRIEVE CHUNKS
# ======================
def retrieve_chunks(query, k=5):
    q_emb = np.array([get_embedding(query)])
    distances, indices = index.search(q_emb, k)
    return [chunks[i] for i in indices[0]]
