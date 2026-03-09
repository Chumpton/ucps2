const COSMIC_QUIZ_DATA = [
    {
        question: "In the silence between stars, where does your mind drift?",
        options: [
            { text: "To the structure of the Grid (Order)", energy: "structural", resonance: "Saturn" },
            { text: "To the chaotic void (Entropy)", energy: "kinetic", resonance: "Uranus" },
            { text: "To the connection of all things (Union)", energy: "magnetic", resonance: "Neptune" }
        ]
    },
    {
        question: "A path diverges. One way is lit by safety, the other by mystery. You choose:",
        options: [
            { text: "The lit path (Preservation)", energy: "grounded", resonance: "Earth" },
            { text: "The mystery (Discovery)", energy: "radiant", resonance: "Jupiter" },
            { text: "I forge a new path (Will)", energy: "combustive", resonance: "Mars" }
        ]
    },
    {
        question: "Time is experienced as:",
        options: [
            { text: "A linear sequence (Chronos)", energy: "linear", resonance: "Mercury" },
            { text: "A cyclical rhythm (Kairos)", energy: "harmonic", resonance: "Moon" },
            { text: "An eternal now (Aion)", energy: "solar", resonance: "Sun" }
        ]
    }
];

class CosmicQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.answers = [];
        this.container = document.getElementById('quiz-view');
        this.questionEl = document.getElementById('quiz-question');
        this.optionsEl = document.getElementById('quiz-options');
        this.progressEl = document.getElementById('quiz-progress');
        this.resultView = document.getElementById('quiz-result');
        this.finalCoordsEl = document.getElementById('final-coords');
    }

    start() {
        this.currentQuestion = 0;
        this.answers = [];
        document.getElementById('position-result').style.display = 'none'; // Hide compass
        this.container.style.display = 'flex';
        this.resultView.style.display = 'none';
        this.animateIn();
        this.renderQuestion();
    }

    renderQuestion() {
        const q = COSMIC_QUIZ_DATA[this.currentQuestion];
        this.questionEl.innerHTML = q.question;
        this.optionsEl.innerHTML = '';

        // Update Progress
        const percent = ((this.currentQuestion) / COSMIC_QUIZ_DATA.length) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${percent}%`;

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.innerText = opt.text;
            btn.style.animationDelay = `${idx * 0.1}s`;
            btn.onclick = () => this.selectAnswer(opt);
            this.optionsEl.appendChild(btn);
        });
    }

    selectAnswer(option) {
        this.answers.push(option);
        if (this.currentQuestion < COSMIC_QUIZ_DATA.length - 1) {
            this.currentQuestion++;
            this.renderQuestion();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        this.container.style.display = 'none';
        this.resultView.style.display = 'flex';

        // Calculate Resonance
        const dominantResonance = this.answers[Math.floor(Math.random() * this.answers.length)].resonance;
        const finalCoord = `ULC0.${dominantResonance.substring(0, 3).toUpperCase()}.Z${Math.floor(Math.random() * 9) + 1}`;

        // Render Result
        const resonanceEl = document.getElementById('quiz-resonance');
        resonanceEl.innerText = dominantResonance;
        this.finalCoordsEl.innerText = finalCoord;

        // Save to LocalStorage (Persistence)
        const userData = {
            resonance: dominantResonance,
            coordinates: finalCoord,
            timestamp: Date.now()
        };
        localStorage.setItem('ucps_user_data', JSON.stringify(userData));
    }

    animateIn() {
        this.container.style.opacity = '0';
        setTimeout(() => this.container.style.opacity = '1', 50);
    }
}

// Global Instance
window.cosmicQuiz = new CosmicQuiz();

// Hook up button
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('quiz-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            window.cosmicQuiz.start();
        });
    }
});
