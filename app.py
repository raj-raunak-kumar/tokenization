from flask import Flask, request, jsonify, render_template
from transformers import AutoTokenizer

app = Flask(__name__)

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained("unsloth/Llama-3.2-3B-Instruct")
print("Tokenizer loaded successfully!")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/tokenize", methods=["POST"])
def tokenize():
    data = request.json
    text = data.get("text", "")
    
    if not text:
        return jsonify({"tokens": []})
        
    try:
        encoding = tokenizer(text, return_offsets_mapping=True, add_special_tokens=False)
        input_ids = encoding["input_ids"]
        offsets = encoding["offset_mapping"]
        
        tokens = []
        for token_id, offset in zip(input_ids, offsets):
            start, end = offset
            if start == end:
                continue
            
            raw_string = text[start:end]
            tokens.append({
                "id": token_id,
                "text": raw_string
            })
            
        return jsonify({"tokens": tokens})
    except Exception as e:
        print(f"Error during tokenization: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8001)
