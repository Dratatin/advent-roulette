// Advent Calendar Roulette Application
(function() {
    'use strict';

    // Configuration
    // Note: This password is a simple barrier, not real security (visible in source)
    const PASSWORD = 'advent2024';
    const TOTAL_NUMBERS = 24;
    const STORAGE_KEY = 'adventRouletteState';

    // State
    let state = {
        remainingNumbers: [],
        history: [],
        lastDrawDate: null
    };

    // DOM Elements
    const rouletteDisplay = document.getElementById('rouletteDisplay');
    const spinButton = document.getElementById('spinButton');
    const message = document.getElementById('message');
    const numbersGrid = document.getElementById('numbersGrid');
    const historyList = document.getElementById('historyList');
    const resetButton = document.getElementById('resetButton');

    // Initialize the application
    function init() {
        loadState();
        renderNumbers();
        renderHistory();
        updateButtonState();
    }

    // Load state from localStorage
    function loadState() {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                state = JSON.parse(savedState);
            } catch (e) {
                resetState();
            }
        } else {
            resetState();
        }
    }

    // Save state to localStorage
    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // Reset state to initial values
    function resetState() {
        state = {
            remainingNumbers: Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1),
            history: [],
            lastDrawDate: null
        };
        saveState();
    }

    // Get today's date as a string (YYYY-MM-DD)
    function getTodayString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // Check if a draw has already been made today
    function hasDrawnToday() {
        return state.lastDrawDate === getTodayString();
    }

    // Update button state based on current conditions
    function updateButtonState() {
        if (state.remainingNumbers.length === 0) {
            spinButton.disabled = true;
            message.textContent = '🎉 All numbers have been drawn! The calendar is complete!';
        } else if (hasDrawnToday()) {
            spinButton.disabled = true;
            message.textContent = '⏰ You have already drawn today. Come back tomorrow!';
        } else {
            spinButton.disabled = false;
            message.textContent = `${state.remainingNumbers.length} numbers remaining. Good luck!`;
        }
    }

    // Render the numbers grid
    function renderNumbers() {
        numbersGrid.innerHTML = '';
        for (let i = 1; i <= TOTAL_NUMBERS; i++) {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.textContent = i;
            if (!state.remainingNumbers.includes(i)) {
                cell.classList.add('drawn');
            }
            numbersGrid.appendChild(cell);
        }
    }

    // Render the history list
    function renderHistory() {
        historyList.innerHTML = '';
        // Show history in reverse chronological order
        const reversedHistory = [...state.history].reverse();
        reversedHistory.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="date">${formatDate(item.date)}</span>
                <span class="number">${item.number}</span>
            `;
            historyList.appendChild(li);
        });
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    // Spin animation using setTimeout for proper slowdown effect
    function animateSpin(callback) {
        const duration = 2000;
        let elapsed = 0;
        let currentInterval = 50;

        rouletteDisplay.classList.add('spinning');

        function step() {
            elapsed += currentInterval;
            // Show random number during spin
            const randomIndex = Math.floor(Math.random() * state.remainingNumbers.length);
            rouletteDisplay.textContent = state.remainingNumbers[randomIndex];

            if (elapsed >= duration) {
                rouletteDisplay.classList.remove('spinning');
                callback();
                return;
            }

            // Slow down towards the end
            if (elapsed > duration * 0.7) {
                currentInterval += 20;
            }

            setTimeout(step, currentInterval);
        }

        step();
    }

    // Draw a number
    function drawNumber() {
        if (state.remainingNumbers.length === 0 || hasDrawnToday()) {
            return;
        }

        // Disable button during animation
        spinButton.disabled = true;
        message.textContent = '🎰 Spinning...';

        animateSpin(() => {
            // Select random number
            const randomIndex = Math.floor(Math.random() * state.remainingNumbers.length);
            const drawnNumber = state.remainingNumbers[randomIndex];

            // Update state
            state.remainingNumbers = state.remainingNumbers.filter(n => n !== drawnNumber);
            state.history.push({
                number: drawnNumber,
                date: getTodayString()
            });
            state.lastDrawDate = getTodayString();

            // Save and update UI
            saveState();
            rouletteDisplay.textContent = drawnNumber;
            renderNumbers();
            renderHistory();
            updateButtonState();

            message.textContent = `🎉 Today's number is: ${drawnNumber}!`;
        });
    }

    // Reset the calendar (requires password)
    function resetCalendar() {
        const enteredPassword = prompt('Enter the password to reset the calendar:');
        
        if (enteredPassword === null) {
            return; // User cancelled
        }

        if (enteredPassword === PASSWORD) {
            if (confirm('Are you sure you want to reset the calendar? All progress will be lost.')) {
                resetState();
                rouletteDisplay.textContent = '?';
                renderNumbers();
                renderHistory();
                updateButtonState();
                alert('Calendar has been reset!');
            }
        } else {
            alert('Incorrect password!');
        }
    }

    // Event listeners
    spinButton.addEventListener('click', drawNumber);
    resetButton.addEventListener('click', resetCalendar);

    // Initialize when DOM is ready
    init();
})();
