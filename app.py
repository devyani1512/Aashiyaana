from flask import Flask, request, jsonify, send_from_directory
import openai
import os
from dotenv import load_dotenv
from embedder import retrieve_chunks  # ⬅️ Assumes 'embedder.py' contains retrieval logic

# ======================
# CONFIGURATION
# ======================
load_dotenv()
# Load API Key from environment variables (best practice)
openai.api_key = os.getenv("OPENAI_API_KEY") 

CHAT_MODEL = "gpt-4o-mini"

# ======================
# GENERATE ANSWER
# ======================
def generate_answer(query):
    # This function relies on the external 'embedder.py' being correctly set up
    # and initialized to create the FAISS index when the app starts.
    context = "\n".join(retrieve_chunks(query))
    
    # Adjusted prompt for clearer instruction regarding greetings
    prompt = f"""
You are a PDF-based assistant. Your primary function is to answer questions using the content provided below.
If the answer to the user's question cannot be found in the given context, you must respond with the exact phrase:
"I could not find the answer in the provided document"

EXCEPTION: If the user provides a simple greeting (e.g., "Hi", "Hello", "How are you?"), you may respond with a polite, brief greeting in return, but DO NOT use any outside knowledge for any other purpose.

CONTEXT FROM PDF:
{context}

USER QUESTION:
{query}

YOUR ANSWER:
"""
    try:
        resp = openai.ChatCompletion.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        return resp.choices[0].message.content
    except Exception as e:
        # Handle potential API errors gracefully
        print(f"OpenAI API Error: {e}")
        return "Sorry, I experienced an internal error while processing that request."


# ======================
# FLASK APP
# ======================
app = Flask(__name__)
# Get the absolute path to the directory where app.py is located
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route("/")
def home():
    """
    Serves the chatbot.html file from the root directory.
    This page (and the game page) must be accessed via http://127.0.0.1:5000/
    """
    return send_from_directory(ROOT_DIR, "chatbot.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")
    if not user_message:
        return jsonify({"ai": "Please provide a message."})
    
    # Process the message and get the AI's answer
    answer = generate_answer(user_message)
    
    # Return the AI answer as clean JSON (the correct protocol for the client)
    return jsonify({"ai": answer})

if __name__ == "__main__":
    # Flask defaults to port 5000. Do not run any other server (like Live Server)
    # when app.py is running, or you will get port conflicts or "Invalid JSON" errors.
    print("Flask server running. Access at: http://127.0.0.1:5000/")
    app.run(debug=True)