document.addEventListener("DOMContentLoaded", () => {
    const textInput = document.getElementById("text-input");
    const tokenDisplay = document.getElementById("token-display");
    const tokenCount = document.getElementById("token-count");
    
    // Mission UI Elements
    const missionCards = document.querySelectorAll(".mission-card");
    const insightPanel = document.getElementById("insight-panel");
    const insightTitle = document.getElementById("insight-title");
    const insightText = document.getElementById("insight-text");
    const insightTip = document.getElementById("insight-tip");

    const missions = [
        { // Level 0
            text: "A token can be a whole word, a syllable, or a single letter.",
            title: "💡 Level 0: The Basics",
            insight: "Language models do not read letter-by-letter. They process text in chunks called 'tokens'. Observe how common semantic units remain intact while punctuation is often segmented.",
            tip: "When API pricing indicates '$1 per 1M tokens', it corresponds roughly to 750,000 English words."
        },
        { // Level 1
            text: "strawberry",
            title: "💡 Level 1: The Spelling Illusion",
            insight: "The model does not perceive 10 characters; it processes 3 chunks: 'str', 'aw', and 'berry'. This explains the systemic failure in character-level reasoning tasks.",
            tip: "To force character-level processing, prompt the model using hyphenated structures: s-t-r-a-w-b-e-r-r-y."
        },
        { // Level 2
            text: "Hello\n Hello",
            title: "💡 Level 2: The Space Case",
            insight: "The initial 'Hello' maps to a different high-dimensional vector than ' Hello' (inclusive of the leading space).",
            tip: "In few-shot prompting, structural consistency is paramount. A trailing space alters the predictive token distribution entirely."
        },
        { // Level 3
            text: "apple Apple APPLE",
            title: "💡 Level 3: The Capitalization Trap",
            insight: "Capitalization alters the tokenization scheme. As 'APPLE' in uppercase appears less frequently in the pre-training corpus, it may fragment sub-optimally.",
            tip: "Avoid uppercase prompting. Forcing the model into low-frequency token distributions degrades inferential capabilities."
        },
        { // Level 4
            text: "123 + 4567 = 4690",
            title: "💡 Level 4: The Math Mystery",
            insight: "Numeric tokenization is inconsistent. '123' forms a single token, whereas '4567' fragments into '45' and '67'. This destroys spatial alignment for arithmetic operations.",
            tip: "For complex arithmetic, utilize structured Python code generation rather than native language generation."
        },
        { // Level 5
            text: "user_name vs user-name",
            title: "💡 Level 5: The Punctuation Penalty",
            insight: "Underscores preserve contiguous token blocks ('user_name'), whereas hyphens cause fragmentation ('user-name').",
            tip: "To ensure exact-match retrieval of specific identifiers, utilize snake_case or CamelCase formatting."
        },
        { // Level 6
            text: "👨‍👩‍👧‍👦",
            title: "💡 Level 6: The Emoji Enigma",
            insight: "A complex emoji is a composite of multiple hidden unicode tokens combined via Zero-Width Joiners. This complexity frequently induces generation hallucinations.",
            tip: "Emojis may influence semantic tone but should not be relied upon for structural or logical prompting constraints."
        },
        { // Level 7
            text: "<article>\nHello\n</article>",
            title: "💡 Level 7: The Formatting Trick",
            insight: "HTML markup tokenizes optimally due to its prevalence in the model's training corpus (e.g., CommonCrawl, GitHub).",
            tip: "Delimit context and instructions using standard XML/HTML tags (e.g., <data>...</data>) for maximal parsing reliability."
        },
        { // Level 8
            text: "definitely vs definately",
            title: "💡 Level 8: The Typo Tax",
            insight: "A typographical error fractures the token mapping. 'definitely' is a single vector, whereas 'definately' fractures into suboptimal subwords.",
            tip: "Orthographic precision is critical. Typos disrupt semantic linkage in the model's embedding space."
        },
        { // Level 9
            text: "Hello world\nनमस्ते दुनिया\nBonjour le monde",
            title: "💡 Level 9: The Language Tax",
            insight: "English text typically maps 1:1 with tokens. Non-English text fragments heavily due to underrepresentation in the BPE training corpus.",
            tip: "This systemic bias dictates that multilingual inference is computationally more expensive and restricted by tighter context windows."
        },
        { // Boss Level (Index 10)
            text: "",
            title: "🏆 Boss Level: The 10/6 Puzzle",
            insight: "LLMs cannot execute dictionary queries bounded by token fragmentation counts. They rely on probabilistic generation, rendering this task nearly impossible for them.",
            tip: "Input an alphabetic English string of exactly 10 characters that segments into exactly 6 tokens. Only 5 valid solutions exist. Reward: Rs. 50."
        },
        { // Bonus Level (Index 11)
            text: "",
            title: "🏆 Bonus Level: Linguistics Pro",
            insight: "Tokenizers typically fragment morphologically complex words into constituent roots and affixes, unless the exact string is extraordinarily frequent in the training corpus.",
            tip: "Input a 13-character alphabetic English string that resolves to exactly 1 token. Only 17 valid solutions exist. Reward: Rs. 50."
        }
    ];

    let fetchTimeout;

    async function fetchTokens(text) {
        if (!text) {
            tokenDisplay.innerHTML = "";
            tokenCount.textContent = "0";
            return;
        }

        try {
            const response = await fetch('/api/tokenize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            
            if (data.tokens) {
                renderTokens(data.tokens);
            }
        } catch (error) {
            console.error("Error fetching tokens:", error);
        }
    }

    function renderTokens(tokens) {
        tokenDisplay.innerHTML = "";
        tokenCount.textContent = tokens.length;

        tokens.forEach((token, index) => {
            const span = document.createElement("span");
            span.className = `token-block color-${index % 5}`;
            span.textContent = token.text;
            span.setAttribute("data-id", token.id);
            tokenDisplay.appendChild(span);
        });

        // Boss Level Victory Check
        const currentText = textInput.value.trim();
        const isOnlyLetters = /^[a-zA-Z]+$/.test(currentText);
        const charCount = currentText.length;
        
        const oldVic = document.getElementById("victory-msg");
        if (oldVic) oldVic.remove();

        const activeCard = document.querySelector(".mission-card.active");
        if (activeCard && parseInt(activeCard.getAttribute("data-mission")) === 10) {
            if (isOnlyLetters && charCount === 10 && tokens.length === 6) {
                const vic = document.createElement("div");
                vic.id = "victory-msg";
                vic.style.marginTop = "1.5rem";
                vic.style.padding = "1rem";
                vic.style.background = "rgba(245, 158, 11, 0.2)";
                vic.style.border = "2px solid #f59e0b";
                vic.style.borderRadius = "8px";
                vic.style.color = "#fcd34d";
                vic.style.fontWeight = "bold";
                vic.style.fontSize = "1.2rem";
                vic.style.animation = "pulse 1s infinite";
                vic.innerHTML = `🎉 SUCCESS: Valid 10/6 combination detected. String: "${currentText}". Claim Rs. 50 reward.`;
                insightPanel.appendChild(vic);
            }
        }
        
        if (activeCard && parseInt(activeCard.getAttribute("data-mission")) === 11) {
            if (isOnlyLetters && charCount === 13 && tokens.length === 1) {
                const vic = document.createElement("div");
                vic.id = "victory-msg";
                vic.style.marginTop = "1.5rem";
                vic.style.padding = "1rem";
                vic.style.background = "rgba(16, 185, 129, 0.1)";
                vic.style.border = "1px solid #10b981";
                vic.style.borderRadius = "4px";
                vic.style.color = "#10b981";
                vic.style.fontWeight = "600";
                vic.style.fontSize = "1.1rem";
                vic.style.animation = "pulse 1s infinite";
                vic.innerHTML = `🎉 SUCCESS: Valid 13/1 morphology detected. String: "${currentText}". Claim Rs. 50 reward.`;
                insightPanel.appendChild(vic);
            }
        }
    }

    function scheduleFetch() {
        clearTimeout(fetchTimeout);
        fetchTimeout = setTimeout(() => {
            fetchTokens(textInput.value);
        }, 300);
    }

    // Handle Mission Clicks
    missionCards.forEach(card => {
        card.addEventListener("click", () => {
            // Update Active State
            missionCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            // Get Mission Data
            const missionId = parseInt(card.getAttribute("data-mission"));
            const mission = missions[missionId];

            // Update UI
            textInput.value = mission.text;
            insightTitle.innerHTML = mission.title;
            insightText.textContent = mission.insight;
            insightTip.textContent = mission.tip;
            
            const tipLabel = document.getElementById("tip-label");
            const tipContainer = document.querySelector(".prompt-tip");
            
            if (missionId >= 10) {
                tipLabel.innerHTML = "🎯 Challenge:";
                tipContainer.classList.add("challenge-mode");
            } else {
                tipLabel.innerHTML = "🎓 Pro Tip:";
                tipContainer.classList.remove("challenge-mode");
            }
            
            insightPanel.classList.remove("hidden");

            // Trigger Fetch
            fetchTokens(mission.text);
        });
    });

    textInput.addEventListener("input", scheduleFetch);

    // Initial load
    fetchTokens(textInput.value);
});
