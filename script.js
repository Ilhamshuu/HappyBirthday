document.addEventListener('DOMContentLoaded', function() {

    // --- Live Age Counter ---
    const birthDate = new Date('2006-08-14T00:00:00');
    const countdownElement = document.getElementById('countdown');

    function updateAge() {
        const now = new Date();

        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();
        let days = now.getDate() - birthDate.getDate();
        let hours = now.getHours() - birthDate.getHours();
        let minutes = now.getMinutes() - birthDate.getMinutes();
        let seconds = now.getSeconds() - birthDate.getSeconds();

        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
            months--;
        }
        if (months < 0) { months += 12; years--; }

        countdownElement.innerHTML = `${years}y ${months}m ${days}d <br> ${hours}h ${minutes}m ${seconds}s`;
    }
    setInterval(updateAge, 1000);
    updateAge();

    // --- Initialize AOS (Animate on Scroll) ---
    AOS.init({
        duration: 800,
        once: true,
    });

    // --- Initialize LightGallery ---
    lightGallery(document.getElementById('lightgallery'), {
        speed: 500,
        download: false
    });

    // --- Hall of Fame Scroller ---
    const scroller = document.getElementById('hall-of-fame-scroller');
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');
    if (scroller && scrollLeftBtn && scrollRightBtn) {
        const card = scroller.querySelector('.snap-center');
        const cardWidth = card.offsetWidth + parseInt(getComputedStyle(card.parentElement).gap);

        scrollRightBtn.addEventListener('click', () => {
            scroller.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
        scrollLeftBtn.addEventListener('click', () => {
            scroller.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
    }

    // --- Video Uploader ---
    const videoUploadInput = document.getElementById('video-upload');
    const videoPlayer = document.getElementById('video-player');
    const videoUploadLabel = document.getElementById('video-upload-label');

    if(videoUploadInput && videoPlayer && videoUploadLabel) {
        videoUploadLabel.addEventListener('click', () => {
            videoUploadInput.click();
        });

        videoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const videoURL = URL.createObjectURL(file);
                videoPlayer.src = videoURL;
                videoPlayer.classList.remove('hidden');
                videoUploadLabel.classList.add('hidden');
                videoPlayer.play();
            }
        });
    }


    // --- Envelope + Typewriter Letter ---
    const envelopeWrap = document.getElementById('envelope-wrap');
    const envelope = document.getElementById('envelope');
    const letter = document.getElementById('letter');
    const replayBtn = document.getElementById('replay-letter');

    if (envelopeWrap && envelope && letter) {
        const lines = Array.from(letter.querySelectorAll('p'));
        lines.forEach((line) => { line.dataset.fullText = line.textContent.trim(); });
        let typeTimer = null;

        function fitLetter() {
            if (envelopeWrap.classList.contains('opened') && letter.style.maxHeight !== 'none') {
                letter.style.maxHeight = letter.scrollHeight + 'px';
            }
        }

        function typeLetter() {
            if (typeTimer) window.clearTimeout(typeTimer);
            let lineIndex = 0;

            function typeLine() {
                if (lineIndex >= lines.length) {
                    letter.style.maxHeight = 'none';
                    return;
                }
                const el = lines[lineIndex++];
                const full = el.dataset.fullText;
                el.textContent = '';

                const caret = document.createElement('span');
                caret.className = 'type-caret';
                el.appendChild(caret);

                let charIndex = 0;
                const step = () => {
                    if (charIndex < full.length) {
                        const char = full[charIndex++];
                        caret.insertAdjacentText('beforebegin', char);
                        typeTimer = window.setTimeout(step, char === ' ' ? 10 : 20);
                    } else {
                        caret.remove();
                        typeTimer = window.setTimeout(typeLine, 260);
                    }
                };
                step();
            }
            typeLine();
        }

        function openEnvelope() {
            if (envelopeWrap.classList.contains('opened')) return;
            envelopeWrap.classList.add('opening');
            window.setTimeout(() => {
                envelopeWrap.classList.add('opened');
                fitLetter();
                if (replayBtn) replayBtn.classList.add('show');
                window.setTimeout(typeLetter, 700);
            }, 650);
        }

        window.addEventListener('resize', fitLetter);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(fitLetter);
        }

        envelope.addEventListener('click', openEnvelope);
        envelope.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openEnvelope();
            }
        });
        if (replayBtn) {
            replayBtn.addEventListener('click', typeLetter);
        }
    }

    // --- Background Music ---
    const music = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');
    const toast = document.getElementById('toast');

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        window.setTimeout(() => toast.classList.remove('show'), 3200);
    }

    if (music && musicBtn) {
        music.volume = 0.45;

        function musicMissing() {
            musicBtn.classList.add('hidden');
            showToast('Musiknya belum ada 🥲 (taruh file .mp3 di folder audio/bg-music.mp3)');
        }

        music.addEventListener('play', () => {
            musicBtn.classList.add('is-playing');
            if (musicIcon) musicIcon.textContent = '♫';
        });
        music.addEventListener('pause', () => {
            musicBtn.classList.remove('is-playing');
            if (musicIcon) musicIcon.textContent = '♪';
        });
        music.addEventListener('error', musicMissing);

        musicBtn.addEventListener('click', () => {
            if (music.paused) {
                const started = music.play();
                if (started && typeof started.catch === 'function') {
                    started.catch(musicMissing);
                }
            } else {
                music.pause();
            }
        });
    }

    // --- Gift Question: Runaway "No" Button ---
    const giftButtons = document.getElementById('gift-buttons');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const noHint = document.getElementById('no-hint');
    const giftThanks = document.getElementById('gift-thanks');

    if (giftButtons && btnYes && btnNo) {
        const questionText = giftButtons.previousElementSibling;
        let noAttempts = 0;

        function placeNoButton() {
            const boxW = giftButtons.clientWidth;
            const boxH = giftButtons.clientHeight;
            const btnW = btnNo.offsetWidth;
            const btnH = btnNo.offsetHeight;
            const maxX = Math.max(0, boxW - btnW);
            const maxY = Math.max(0, boxH - btnH);
            const pad = 2;

            const yesBox = btnYes.getBoundingClientRect();
            const wrapBox = giftButtons.getBoundingClientRect();
            const yesLeft = yesBox.left - wrapBox.left - 10;
            const yesRight = yesBox.right - wrapBox.left + 10;
            const yesTop = yesBox.top - wrapBox.top - 10;
            const yesBottom = yesBox.bottom - wrapBox.top + 10;

            // Kandidat posisi (grid 5x3) yang gak nutupin tombol "Iya"
            const free = [];
            const all = [];
            for (let i = 0; i <= 4; i++) {
                for (let j = 0; j <= 2; j++) {
                    const x = maxX === 0 ? 0 : pad + (maxX - pad * 2) * (i / 4);
                    const y = maxY === 0 ? 0 : pad + (maxY - pad * 2) * (j / 2);
                    const hit = !(x + btnW <= yesLeft || x >= yesRight || y + btnH <= yesTop || y >= yesBottom);
                    all.push({ x, y, dist: Math.hypot(x + btnW / 2 - (yesBox.left - wrapBox.left + yesBox.width / 2), y + btnH / 2 - (yesBox.top - wrapBox.top + yesBox.height / 2)) });
                    if (!hit) free.push({ x, y });
                }
            }

            if (free.length) {
                const pick = free[Math.floor(Math.random() * free.length)];
                btnNo.style.left = pick.x + 'px';
                btnNo.style.top = pick.y + 'px';
            } else {
                all.sort((a, b) => b.dist - a.dist);
                btnNo.style.left = all[0].x + 'px';
                btnNo.style.top = all[0].y + 'px';
            }
        }

        function runAway() {
            noAttempts++;
            btnNo.classList.add('fade-out');
            window.setTimeout(() => {
                placeNoButton();
                btnNo.classList.remove('fade-out');
            }, 180);
            if (noHint) {
                noHint.classList.add('opacity-100');
            }
        }

        placeNoButton();
        window.addEventListener('resize', placeNoButton);

        giftButtons.addEventListener('pointermove', (event) => {
            if (giftButtons.classList.contains('hidden')) return;
            const bounds = btnNo.getBoundingClientRect();
            const centerX = bounds.left + bounds.width / 2;
            const centerY = bounds.top + bounds.height / 2;
            const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
            const safeRadius = Math.max(bounds.width, bounds.height) + 70;
            if (distance < safeRadius) {
                runAway();
            }
        });

        btnNo.addEventListener('click', runAway);
        btnNo.addEventListener('touchstart', (event) => { event.preventDefault(); runAway(); });

        btnYes.addEventListener('click', () => {
            giftButtons.classList.add('hidden');
            if (noHint) noHint.classList.add('hidden');
            if (questionText) questionText.classList.add('hidden');
            giftThanks.classList.remove('hidden');
            launchConfetti();
        });
    }

    function launchConfetti() {
        const colors = ['#FFB7C5', '#FF6B9A', '#FFD1DC', '#FF8FAB', '#FFFFFF', '#F7A8C4'];
        for (let i = 0; i < 80; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
            piece.style.animationDelay = (Math.random() * 0.8) + 's';
            piece.style.width = (6 + Math.random() * 8) + 'px';
            piece.style.height = (8 + Math.random() * 10) + 'px';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            document.body.appendChild(piece);
            window.setTimeout(() => piece.remove(), 6500);
        }
    }

    // --- Sakura Petal Animation ---
    const canvas = document.getElementById('sakura-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let petals = [];
        const numPetals = 50;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function Petal() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 2 - canvas.height;
            this.w = 25 + Math.random() * 15;
            this.h = 20 + Math.random() * 10;
            this.opacity = this.w / 40;
            this.flip = Math.random();
            this.xSpeed = 1.5 + Math.random() * 2;
            this.ySpeed = 1 + Math.random() * 1;
            this.flipSpeed = Math.random() * 0.03;
        }

        Petal.prototype.draw = function() {
            if (this.y > canvas.height || this.x > canvas.width) {
                this.x = -this.w;
                this.y = Math.random() * canvas.height * 2 - canvas.height;
                this.xSpeed = 1.5 + Math.random() * 2;
                this.ySpeed = 1 + Math.random() * 1;
                this.flip = Math.random();
            }
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.bezierCurveTo(this.x + this.w / 2, this.y - this.h / 2, this.x + this.w, this.y, this.x + this.w / 2, this.y + this.h / 2);
            ctx.bezierCurveTo(this.x, this.y + this.h, this.x - this.w / 2, this.y, this.x, this.y);
            ctx.closePath();
            ctx.fillStyle = '#FFB7C5';
            ctx.fill();
        }

        Petal.prototype.update = function() {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
            this.flip += this.flipSpeed;
            this.draw();
        }

        function createPetals() {
            petals = [];
            for (let i = 0; i < numPetals; i++) {
                petals.push(new Petal());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            petals.forEach(petal => {
                petal.update();
            });
            requestAnimationFrame(animate);
        }

        createPetals();
        animate();
    }
});

