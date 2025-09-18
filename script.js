class CrapsSimulator {
    constructor() {
        this.passLineBet = 0;
        this.oddsBet = 0;
        this.betType = 'pass';
        this.oddsMultiplier = '2x';
        this.startingBankroll = 0;
        this.currentBankroll = 0;
        this.maxBankroll = 0;
        this.minBankroll = 0;
        this.point = null;
        this.comeOutPhase = true;
        this.totalBet = 0;
        this.totalWon = 0;
        this.rollHistory = [];
        this.runningTotal = 0;
        this.isSimulating = false;
        this.ruinReached = false;
        this.simulationResults = [];
        this.totalSimulations = 0;
        this.winningSimulations = 0;
        this.losingSimulations = 0;
        this.ruinSimulations = 0;
        this.maxProfit = 0;
        
        // Come bet tracking for progressive come strategy
        this.comeBets = []; // Array of {point: number, betAmount: number, oddsAmount: number}
        this.comeBetAmount = 0;
        
        this.initializeEventListeners();
        this.initializeAnimations();
    }
    
    initializeEventListeners() {
        // Simulation button
        const simulateButton = document.getElementById('startSimulation');
        simulateButton.addEventListener('click', () => {
            this.startSimulation();
        });
        
        // Add touch feedback for simulate button
        simulateButton.addEventListener('touchstart', (e) => {
            e.target.style.transform = 'scale(0.98)';
        });
        
        simulateButton.addEventListener('touchend', (e) => {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 150);
        });
        
        // Clear history button
        const clearButton = document.getElementById('clearHistory');
        clearButton.addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Add touch feedback for clear button
        clearButton.addEventListener('touchstart', (e) => {
            e.target.style.transform = 'scale(0.95)';
        });
        
        clearButton.addEventListener('touchend', (e) => {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 150);
        });
        
        // Input changes
        document.getElementById('passLineBet').addEventListener('input', () => {
            this.updateOddsBet();
            this.animateInputChange();
        });
        
        document.getElementById('bankroll').addEventListener('input', () => {
            this.animateInputChange();
        });
        
        document.getElementById('oddsMultiplier').addEventListener('change', () => {
            this.updateOddsBet();
            this.animateSelectChange();
        });
        
        document.getElementById('numSimulations').addEventListener('input', (e) => {
            this.numSimulations = parseInt(e.target.value) || 1;
        });
        
        // Bet type changes
        document.querySelectorAll('input[name="betType"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.betType = radio.value;
                this.animateRadioChange(radio);
            });
            
            // Add touch feedback for mobile
            radio.addEventListener('touchstart', (e) => {
                e.target.closest('.radio-label').style.transform = 'scale(0.95)';
            });
            
            radio.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    e.target.closest('.radio-label').style.transform = '';
                }, 150);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.startSimulation();
            }
            if (e.key === 'Escape') {
                this.clearHistory();
            }
        });
    }
    
    initializeAnimations() {
        // Add loading states and smooth transitions
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        
        // Add mobile-specific features
        this.initializeMobileFeatures();
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        // Observe elements for scroll animations
        document.querySelectorAll('.stat-card, .config-group').forEach(el => {
            observer.observe(el);
        });
    }
    
    setupScrollAnimations() {
        // Add CSS classes for animations
        const style = document.createElement('style');
        style.textContent = `
            .stat-card, .config-group {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .stat-card.animate-in, .config-group.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            .roll-entry {
                opacity: 0;
                transform: translateX(-20px);
                animation: slideIn 0.3s ease-out forwards;
            }
            @keyframes slideIn {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            .stat-value {
                transition: all 0.3s ease-out;
            }
            .stat-value.updating {
                transform: scale(1.1);
                color: var(--primary-500);
            }
        `;
        document.head.appendChild(style);
    }
    
    initializeMobileFeatures() {
        // Add haptic feedback for supported devices
        this.addHapticFeedback();
        
        // Improve table scrolling on mobile
        this.optimizeTableScrolling();
        
        // Add swipe gestures for tables
        this.addSwipeGestures();
        
        // Add mobile-specific CSS
        this.addMobileCSS();
    }
    
    addHapticFeedback() {
        // Add haptic feedback for button interactions
        const buttons = document.querySelectorAll('.simulate-button, .clear-button, .radio-label');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                // Try to trigger haptic feedback if supported
                if (navigator.vibrate) {
                    navigator.vibrate(10); // Short vibration
                }
            });
        });
    }
    
    optimizeTableScrolling() {
        // Add momentum scrolling for iOS
        const scrollContainers = document.querySelectorAll('.table-scroll-container');
        
        scrollContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
            
            // Add scroll indicators
            container.addEventListener('scroll', () => {
                const { scrollLeft, scrollWidth, clientWidth } = container;
                const scrollPercentage = scrollLeft / (scrollWidth - clientWidth);
                
                // Add visual scroll indicators
                if (scrollPercentage > 0.1) {
                    container.classList.add('scrolled-left');
                } else {
                    container.classList.remove('scrolled-left');
                }
                
                if (scrollPercentage < 0.9) {
                    container.classList.add('scrolled-right');
                } else {
                    container.classList.remove('scrolled-right');
                }
            });
        });
    }
    
    addSwipeGestures() {
        // Add swipe gestures for table navigation
        const tables = document.querySelectorAll('.table-scroll-container');
        
        tables.forEach(table => {
            let startX = 0;
            let startY = 0;
            
            table.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });
            
            table.addEventListener('touchmove', (e) => {
                e.preventDefault(); // Prevent default scrolling
            });
            
            table.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = startX - endX;
                const diffY = startY - endY;
                
                // Only handle horizontal swipes
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        // Swipe left - scroll right
                        table.scrollBy({ left: 200, behavior: 'smooth' });
                    } else {
                        // Swipe right - scroll left
                        table.scrollBy({ left: -200, behavior: 'smooth' });
                    }
                }
            });
        });
    }
    
    addMobileCSS() {
        // Add mobile-specific CSS
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile-specific animations */
            .mobile-tap-feedback {
                transition: transform 150ms ease-in-out;
            }
            
            .mobile-tap-feedback:active {
                transform: scale(0.95);
            }
            
            /* Smooth scrolling for mobile */
            .table-scroll-container {
                -webkit-overflow-scrolling: touch;
                scroll-behavior: smooth;
            }
            
            /* Mobile-optimized table cells */
            @media (max-width: 768px) {
                .history-cell, .simulation-cell {
                    font-size: 0.75rem;
                    padding: 0.5rem 0.25rem;
                }
                
                .history-header-row .history-cell,
                .simulation-header-row .simulation-cell {
                    font-size: 0.625rem;
                    padding: 0.5rem 0.25rem;
                }
                
                .config-input, .config-select {
                    min-height: 44px; /* iOS recommended touch target */
                }
                
                .simulate-button {
                    min-height: 48px; /* iOS recommended touch target */
                }
            }
            
            /* Scroll indicators */
            .table-scroll-container.scrolled-left::before {
                content: '←';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 10;
                pointer-events: none;
            }
            
            .table-scroll-container.scrolled-right::after {
                content: '→';
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 10;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    animateInputChange() {
        const input = document.getElementById('passLineBet');
        input.classList.add('updating');
        setTimeout(() => input.classList.remove('updating'), 200);
    }
    
    animateSelectChange() {
        const select = document.getElementById('oddsMultiplier');
        select.classList.add('updating');
        setTimeout(() => select.classList.remove('updating'), 200);
    }
    
    animateRadioChange(radio) {
        const label = radio.nextElementSibling;
        label.classList.add('selected');
        setTimeout(() => label.classList.remove('selected'), 300);
    }
    
    updateOddsBet() {
        this.passLineBet = parseFloat(document.getElementById('passLineBet').value) || 0;
        this.oddsMultiplier = document.getElementById('oddsMultiplier').value;
        
        // For display purposes, we'll calculate a representative odds bet
        // The actual odds bet will be calculated per roll based on the point
        if (this.oddsMultiplier === '2x') {
            this.oddsBet = this.passLineBet * 2;
        } else {
            // For 3/4/5x, use 4x as representative (middle value)
            this.oddsBet = this.passLineBet * 4;
        }
    }
    
    // Come bet management methods
    addComeBet(point) {
        if (this.betType === 'progressiveCome') {
            const comeBetAmount = this.passLineBet;
            
            this.comeBets.push({
                point: point,
                betAmount: comeBetAmount,
                oddsAmount: 0 // Odds will be added on the next roll
            });
            
            this.comeBetAmount += comeBetAmount; // Only add the come bet amount, not odds yet
            console.log(`Debug: Added come bet on ${point}, amount: ${comeBetAmount}, total come bet amount: ${this.comeBetAmount}`);
        }
    }
    
    removeComeBet(point) {
        if (this.betType === 'progressiveCome') {
            const comeBetIndex = this.comeBets.findIndex(bet => bet.point === point);
            if (comeBetIndex !== -1) {
                const removedBet = this.comeBets.splice(comeBetIndex, 1)[0];
                this.comeBetAmount -= removedBet.betAmount + removedBet.oddsAmount;
            }
        }
    }
    
    getTotalComeBetAmount() {
        return this.comeBetAmount;
    }
    
    getComeBetsOnPoint(point) {
        return this.comeBets.filter(bet => bet.point === point);
    }
    
    clearAllComeBets() {
        this.comeBets = [];
        this.comeBetAmount = 0;
    }
    
    addOddsToExistingComeBets() {
        if (this.betType === 'progressiveCome') {
            for (const comeBet of this.comeBets) {
                if (comeBet.oddsAmount === 0) {
                    // Add odds to this come bet
                    const oddsMultiplier = this.getOddsMultiplierForPoint(comeBet.point);
                    const oddsAmount = comeBet.betAmount * oddsMultiplier;
                    comeBet.oddsAmount = oddsAmount;
                    this.comeBetAmount += oddsAmount;
                    console.log(`Debug: Added odds to come bet on ${comeBet.point}, odds amount: ${oddsAmount}, total come bet amount: ${this.comeBetAmount}`);
                }
            }
        }
    }
    
    // Proper craps come bet logic
    handleComeBets(rollTotal, rollDescription) {
        let comeBetResults = 0;
        let comeBetDescription = '';
        
        // First, check for wins on existing come bet points
        const comeBetsOnRoll = this.getComeBetsOnPoint(rollTotal);
        if (comeBetsOnRoll.length > 0) {
            for (const comeBet of comeBetsOnRoll) {
                comeBetResults += comeBet.betAmount + this.calculateOddsPayout(rollTotal, comeBet.oddsAmount);
                this.removeComeBet(rollTotal);
            }
            comeBetDescription = `Come bet ${rollTotal} wins`;
        }
        
        // Then, handle 7-out (lose all existing come bets)
        if (rollTotal === 7) {
            if (this.comeBets.length > 0) {
                for (const comeBet of this.comeBets) {
                    comeBetResults -= comeBet.betAmount + comeBet.oddsAmount;
                }
                this.clearAllComeBets();
                if (comeBetDescription) {
                    comeBetDescription += ', Come bets lose (7 out)';
                } else {
                    comeBetDescription = 'Come bets lose (7 out)';
                }
            }
        }
        
        // Place a new come bet on this roll (after checking for wins/losses)
        if (!this.comeOutPhase && rollTotal !== this.point) {
            // Don't place come bet on the main point or if there's already a come bet on this number
            const existingComeBet = this.comeBets.find(bet => bet.point === rollTotal);
            if (!existingComeBet) {
                // Always place a come bet on any roll (except main point)
                if (rollTotal === 7 || rollTotal === 11) {
                    // Come bet wins immediately on 7/11
                    comeBetDescription += comeBetDescription ? `, Come bet wins (${rollTotal})` : `Come bet wins (${rollTotal})`;
                    comeBetResults += this.passLineBet;
                } else if (rollTotal === 2 || rollTotal === 3 || rollTotal === 12) {
                    // Come bet loses immediately on 2/3/12
                    comeBetDescription += comeBetDescription ? `, Come bet loses (${rollTotal})` : `Come bet loses (${rollTotal})`;
                    comeBetResults -= this.passLineBet;
                } else {
                    // Come bet establishes point (4,5,6,8,9,10)
                    this.addComeBet(rollTotal);
                    comeBetDescription += comeBetDescription ? `, Come bet placed on ${rollTotal}` : `Come bet placed on ${rollTotal}`;
                }
            }
        }
        
        return {
            results: comeBetResults,
            description: comeBetDescription
        };
    }
    
    getOddsMultiplierForPoint(point) {
        if (this.oddsMultiplier === '2x') {
            return 2; // 2x odds for all points
        } else {
            // 3/4/5x odds based on point
            switch (point) {
                case 4:
                case 10:
                    return 3; // 3x odds
                case 5:
                case 9:
                    return 4; // 4x odds
                case 6:
                case 8:
                    return 5; // 5x odds
                default:
                    return 2;
            }
        }
    }
    
    rollDice() {
        return {
            die1: Math.floor(Math.random() * 6) + 1,
            die2: Math.floor(Math.random() * 6) + 1
        };
    }
    
    getRollTotal(dice) {
        return dice.die1 + dice.die2;
    }
    
    isComeOutRoll() {
        return this.comeOutPhase;
    }
    
    isPointEstablished() {
        return this.point !== null;
    }
    
    isPassLineWin(rollTotal) {
        if (this.isComeOutRoll()) {
            // Come out roll
            return rollTotal === 7 || rollTotal === 11;
        } else {
            // Point roll
            return rollTotal === this.point;
        }
    }
    
    isPassLineLoss(rollTotal) {
        if (this.isComeOutRoll()) {
            // Come out roll
            return rollTotal === 2 || rollTotal === 3 || rollTotal === 12;
        } else {
            // Point roll
            return rollTotal === 7;
        }
    }
    
    isDontPassWin(rollTotal) {
        if (this.isComeOutRoll()) {
            // Come out roll
            return rollTotal === 2 || rollTotal === 3;
        } else {
            // Point roll
            return rollTotal === 7;
        }
    }
    
    isDontPassLoss(rollTotal) {
        if (this.isComeOutRoll()) {
            // Come out roll
            return rollTotal === 7 || rollTotal === 11;
        } else {
            // Point roll
            return rollTotal === this.point;
        }
    }
    
    isDontPassPush(rollTotal) {
        return this.isComeOutRoll() && rollTotal === 12;
    }
    
    calculateOddsPayout(rollTotal) {
        if (!this.isPointEstablished()) return 0;
        
        const oddsMultiplier = this.getOddsMultiplierForPoint(this.point);
        const actualOddsBet = this.passLineBet * oddsMultiplier;
        let oddsPayout = 0;
        
        if (this.betType === 'pass') {
            if (rollTotal === this.point) {
                // Pass line odds win
                switch (this.point) {
                    case 4:
                    case 10:
                        oddsPayout = actualOddsBet * 2; // 2:1 odds
                        break;
                    case 5:
                    case 9:
                        oddsPayout = actualOddsBet * 1.5; // 3:2 odds
                        break;
                    case 6:
                    case 8:
                        oddsPayout = actualOddsBet * 1.2; // 6:5 odds
                        break;
                }
            }
        } else {
            if (rollTotal === 7) {
                // Don't pass odds win
                switch (this.point) {
                    case 4:
                    case 10:
                        oddsPayout = actualOddsBet * 1; // 1:2 odds
                        break;
                    case 5:
                    case 9:
                        oddsPayout = actualOddsBet * 0.67; // 2:3 odds
                        break;
                    case 6:
                    case 8:
                        oddsPayout = actualOddsBet * 0.83; // 5:6 odds
                        break;
                }
            }
        }
        
        return oddsPayout;
    }
    
    calculateAdjustedOddsPayout(rollTotal, adjustedOddsBet) {
        if (!this.isPointEstablished()) return 0;
        
        let oddsPayout = 0;
        
        if (this.betType === 'pass') {
            if (rollTotal === this.point) {
                // Pass line odds win
                switch (this.point) {
                    case 4:
                    case 10:
                        oddsPayout = adjustedOddsBet * 2; // 2:1 odds
                        break;
                    case 5:
                    case 9:
                        oddsPayout = adjustedOddsBet * 1.5; // 3:2 odds
                        break;
                    case 6:
                    case 8:
                        oddsPayout = adjustedOddsBet * 1.2; // 6:5 odds
                        break;
                }
            }
        } else {
            if (rollTotal === 7) {
                // Don't pass odds win
                switch (this.point) {
                    case 4:
                    case 10:
                        oddsPayout = adjustedOddsBet * 1; // 1:2 odds
                        break;
                    case 5:
                    case 9:
                        oddsPayout = adjustedOddsBet * 0.67; // 2:3 odds
                        break;
                    case 6:
                    case 8:
                        oddsPayout = adjustedOddsBet * 0.83; // 5:6 odds
                        break;
                }
            }
        }
        
        return oddsPayout;
    }
    
    async simulateRoll() {
        const dice = this.rollDice();
        const rollTotal = this.getRollTotal(dice);
        const rollNumber = this.rollHistory.length + 1;
        const wasComeOutRoll = this.isComeOutRoll(); // Store the initial state
        
        let passLineResult = 0;
        let oddsResult = 0;
        let totalBet = this.passLineBet;
        let totalWin = 0;
        let rollDescription = '';
        
        // For progressive come strategy, we'll add come bet amounts later after determining if a new come bet should be placed
        
        if (this.isComeOutRoll()) {
            // Come out roll
            // Check if pass line bet would cause ruin
            if (this.currentBankroll - this.passLineBet < 0) {
                // Adjust bet to leave exactly $0 bankroll
                const adjustedPassLineBet = this.currentBankroll;
                totalBet = adjustedPassLineBet;
                
                if (this.betType === 'pass' || this.betType === 'progressiveCome') {
                    if (this.isPassLineWin(rollTotal)) {
                        passLineResult = adjustedPassLineBet;
                        rollDescription = 'Pass Line Win (Adjusted Bet)';
                    } else if (this.isPassLineLoss(rollTotal)) {
                        passLineResult = -adjustedPassLineBet;
                        rollDescription = 'Pass Line Loss (Adjusted Bet)';
                    } else {
                        // Point established
                        this.point = rollTotal;
                        this.comeOutPhase = false;
                        rollDescription = `Point ${this.point} Established (Adjusted Bet)`;
                    }
                } else {
                    if (this.isDontPassWin(rollTotal)) {
                        passLineResult = adjustedPassLineBet;
                        rollDescription = "Don't Pass Win (Adjusted Bet)";
                    } else if (this.isDontPassLoss(rollTotal)) {
                        passLineResult = -adjustedPassLineBet;
                        rollDescription = "Don't Pass Loss (Adjusted Bet)";
                    } else if (this.isDontPassPush(rollTotal)) {
                        passLineResult = 0;
                        rollDescription = "Don't Pass Push (12) (Adjusted Bet)";
                    } else {
                        // Point established
                        this.point = rollTotal;
                        this.comeOutPhase = false;
                        rollDescription = `Point ${this.point} Established (Adjusted Bet)`;
                    }
                }
            } else {
                // Normal betting
                totalBet = this.passLineBet;
                
                if (this.betType === 'pass' || this.betType === 'progressiveCome') {
                    if (this.isPassLineWin(rollTotal)) {
                        passLineResult = this.passLineBet;
                        rollDescription = 'Pass Line Win';
                    } else if (this.isPassLineLoss(rollTotal)) {
                        passLineResult = -this.passLineBet;
                        rollDescription = 'Pass Line Loss';
                    } else {
                        // Point established
                        this.point = rollTotal;
                        this.comeOutPhase = false;
                        rollDescription = `Point ${this.point} Established`;
                        
                        // For progressive come strategy, place a come bet on the next roll
                        if (this.betType === 'progressiveCome') {
                            rollDescription += ' - Come bet placed';
                        }
                    }
                } else {
                    if (this.isDontPassWin(rollTotal)) {
                        passLineResult = this.passLineBet;
                        rollDescription = "Don't Pass Win";
                    } else if (this.isDontPassLoss(rollTotal)) {
                        passLineResult = -this.passLineBet;
                        rollDescription = "Don't Pass Loss";
                    } else if (this.isDontPassPush(rollTotal)) {
                        passLineResult = 0;
                        rollDescription = "Don't Pass Push (12)";
                    } else {
                        // Point established
                        this.point = rollTotal;
                        this.comeOutPhase = false;
                        rollDescription = `Point ${this.point} Established`;
                    }
                }
            }
        } else {
            // Point roll
            const oddsMultiplier = this.getOddsMultiplierForPoint(this.point);
            const actualOddsBet = this.passLineBet * oddsMultiplier;
            const intendedBet = this.passLineBet + actualOddsBet;
            
            // Add odds to existing come bets (progressive come strategy)
            if (this.betType === 'progressiveCome') {
                this.addOddsToExistingComeBets();
            }
            
            // Check if this bet would cause ruin and adjust if necessary
            if (this.currentBankroll - intendedBet < 0) {
                // Reduce bet to leave exactly $0 bankroll
                totalBet = this.currentBankroll;
                // Adjust pass line and odds bet proportionally
                const passLineRatio = this.passLineBet / intendedBet;
                const oddsRatio = actualOddsBet / intendedBet;
                passLineResult = 0; // Will be calculated based on actual bet
                oddsResult = 0; // Will be calculated based on actual bet
            } else {
                totalBet = intendedBet;
                
                // Add existing come bet amounts to total bet for progressive come strategy
                if (this.betType === 'progressiveCome') {
                    console.log(`Debug: Adding existing come bet amount: ${this.getTotalComeBetAmount()}`);
                    totalBet += this.getTotalComeBetAmount();
                    console.log(`Debug: Total bet after adding existing come bets: ${totalBet}`);
                }
            }
            
            if (this.betType === 'pass' || this.betType === 'progressiveCome') {
                if (this.isPassLineWin(rollTotal)) {
                    if (totalBet === this.currentBankroll) {
                        // Adjusted bet - calculate proportional winnings
                        const passLineRatio = this.passLineBet / intendedBet;
                        const oddsRatio = actualOddsBet / intendedBet;
                        const actualPassLineBet = totalBet * passLineRatio;
                        const actualOddsBetAdjusted = totalBet * oddsRatio;
                        passLineResult = actualPassLineBet;
                        oddsResult = this.calculateAdjustedOddsPayout(rollTotal, actualOddsBetAdjusted);
                        rollDescription = `Point ${this.point} Hit - Pass Line Win (Adjusted Bet)`;
                    } else {
                        passLineResult = this.passLineBet;
                        oddsResult = this.calculateOddsPayout(rollTotal);
                        rollDescription = `Point ${this.point} Hit - Pass Line Win`;
                    }
                    this.point = null;
                    this.comeOutPhase = true;
                } else if (this.isPassLineLoss(rollTotal)) {
                    if (totalBet === this.currentBankroll) {
                        // Adjusted bet - calculate proportional losses
                        passLineResult = -totalBet;
                        oddsResult = 0;
                        rollDescription = `Seven Out - Pass Line Loss (Adjusted Bet)`;
                    } else {
                        passLineResult = -this.passLineBet;
                        oddsResult = -actualOddsBet;
                        rollDescription = `Seven Out - Pass Line Loss`;
                    }
                    this.point = null;
                    this.comeOutPhase = true;
                } else {
                    rollDescription = `Point ${this.point} - No Decision`;
                }
                
                // Handle come bet wins and losses for progressive come strategy
                if (this.betType === 'progressiveCome') {
                    const comeBetResult = this.handleComeBets(rollTotal, rollDescription);
                    totalWin += comeBetResult.results;
                    if (comeBetResult.description) {
                        rollDescription += ` - ${comeBetResult.description}`;
                    }
                    
                    // Update total bet to include all active come bets
                    totalBet += this.getTotalComeBetAmount();
                }
            } else {
                if (this.isDontPassWin(rollTotal)) {
                    if (totalBet === this.currentBankroll) {
                        // Adjusted bet - calculate proportional winnings
                        const passLineRatio = this.passLineBet / intendedBet;
                        const oddsRatio = actualOddsBet / intendedBet;
                        const actualPassLineBet = totalBet * passLineRatio;
                        const actualOddsBetAdjusted = totalBet * oddsRatio;
                        passLineResult = actualPassLineBet;
                        oddsResult = this.calculateAdjustedOddsPayout(rollTotal, actualOddsBetAdjusted);
                        rollDescription = `Seven Out - Don't Pass Win (Adjusted Bet)`;
                    } else {
                        passLineResult = this.passLineBet;
                        oddsResult = this.calculateOddsPayout(rollTotal);
                        rollDescription = `Seven Out - Don't Pass Win`;
                    }
                    this.point = null;
                    this.comeOutPhase = true;
                } else if (this.isDontPassLoss(rollTotal)) {
                    if (totalBet === this.currentBankroll) {
                        // Adjusted bet - calculate proportional losses
                        passLineResult = -totalBet;
                        oddsResult = 0;
                        rollDescription = `Point ${this.point} Hit - Don't Pass Loss (Adjusted Bet)`;
                    } else {
                        passLineResult = -this.passLineBet;
                        oddsResult = -actualOddsBet;
                        rollDescription = `Point ${this.point} Hit - Don't Pass Loss`;
                    }
                    this.point = null;
                    this.comeOutPhase = true;
                } else {
                    rollDescription = `Point ${this.point} - No Decision`;
                }
            }
        }
        
        totalWin = passLineResult + oddsResult;
        this.runningTotal += totalWin;
        this.totalBet += totalBet;
        this.totalWon += totalWin;
        
        // Update bankroll tracking
        this.currentBankroll = this.startingBankroll + this.runningTotal;
        this.maxBankroll = Math.max(this.maxBankroll, this.currentBankroll);
        this.minBankroll = Math.min(this.minBankroll, this.currentBankroll);
        
        // Check for ruin
        if (this.currentBankroll <= 0) {
            this.ruinReached = true;
            rollDescription += ' - RUIN!';
        }
        
        const rollEntry = {
            rollNumber,
            dice: `${dice.die1}, ${dice.die2}`,
            total: rollTotal,
            betAmount: totalBet,
            winLoss: totalWin,
            runningTotal: this.runningTotal,
            currentBankroll: this.currentBankroll,
            description: rollDescription,
            isPointEstablished: rollDescription.includes('Point') && rollDescription.includes('Established'),
            isRuin: this.ruinReached,
            wasComeOutRoll: wasComeOutRoll
        };
        
        this.rollHistory.push(rollEntry);
        return rollEntry;
    }
    
    async startSimulation() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        const button = document.getElementById('startSimulation');
        const originalText = button.innerHTML;
        
        // Update button state
        button.innerHTML = '<span class="button-icon">⏳</span><span class="button-text">Simulating...</span>';
        button.disabled = true;
        
        // Get simulation parameters
        this.updateOddsBet();
        this.startingBankroll = parseFloat(document.getElementById('bankroll').value) || 1000;
        this.numSimulations = parseInt(document.getElementById('numSimulations').value) || 1;
        const numRolls = parseInt(document.getElementById('numRolls').value);
        
        // Reset simulation tracking
        this.simulationResults = [];
        this.totalSimulations = 0;
        this.winningSimulations = 0;
        this.losingSimulations = 0;
        this.ruinSimulations = 0;
        this.maxProfit = 0;
        
        // Clear previous results
        document.getElementById('rollHistory').innerHTML = '';
        
        // Run multiple simulations
        for (let sim = 0; sim < this.numSimulations; sim++) {
            // Reset for each simulation
            this.point = null;
            this.comeOutPhase = true;
            this.totalBet = 0;
            this.totalWon = 0;
            this.rollHistory = [];
            this.runningTotal = 0;
            this.ruinReached = false;
            this.currentBankroll = this.startingBankroll;
            this.maxBankroll = this.startingBankroll;
            this.minBankroll = this.startingBankroll;
            
            // Simulate rolls for this simulation
            for (let i = 0; i < numRolls; i++) {
                const roll = await this.simulateRoll();
                
                // Only display rolls for the first simulation
                if (sim === 0) {
                    this.displayRoll(roll);
                }
                
                // Update progress every 10 rolls or on last roll
                if (i % 10 === 0 || i === numRolls - 1) {
                    if (sim === 0) {
                        this.updateSummaryStats();
                    }
                    
                    // Small delay for smooth animation
                    if (i < numRolls - 1) {
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                }
                
                // Stop if ruin is reached
                if (this.ruinReached) {
                    break;
                }
            }
            
            // Store simulation results
            const simulationResult = {
                simulationNumber: sim + 1,
                totalRolls: this.rollHistory.length,
                profitLoss: this.runningTotal,
                maxBankroll: this.maxBankroll,
                minBankroll: this.minBankroll,
                endedInRuin: this.ruinReached
            };
            
            this.simulationResults.push(simulationResult);
            this.totalSimulations++;
            
            if (this.ruinReached) {
                this.ruinSimulations++;
                this.losingSimulations++; // Ruin counts as a loss
            } else if (this.runningTotal > 0) {
                this.winningSimulations++;
            } else {
                this.losingSimulations++;
            }
            
            if (this.runningTotal > this.maxProfit) {
                this.maxProfit = this.runningTotal;
            }
            
            // Update button progress
            if (sim < this.numSimulations - 1) {
                button.innerHTML = `<span class="button-icon">⏳</span><span class="button-text">Simulating... ${sim + 1}/${this.numSimulations}</span>`;
            }
        }
        
        // Update displays
        this.updateSummaryStats();
        this.updateTotalSimulationResults();
        this.updateSimulationResultsTable();
        
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        this.isSimulating = false;
    }
    
    displayRoll(roll) {
        const rollElement = document.createElement('div');
        let className = 'roll-entry';
        
        if (roll.isPointEstablished) {
            className += ' point-established';
        }
        if (roll.isRuin) {
            className += ' ruin-reached';
        }
        
        rollElement.className = className;
        
        const winLossClass = roll.winLoss > 0 ? 'win-amount' : 
                           roll.winLoss < 0 ? 'loss-amount' : '';
        
        const bankrollClass = roll.currentBankroll > this.startingBankroll ? 'positive' : 
                             roll.currentBankroll < this.startingBankroll ? 'negative' : '';
        
        const notes = [];
        
        // Add come out roll event labels
        if (roll.wasComeOutRoll) {
            if (roll.total === 7 || roll.total === 11) {
                notes.push(`${roll.total} on come out roll`);
            } else if (roll.total === 2 || roll.total === 3 || roll.total === 12) {
                notes.push(`${roll.total} on come out roll`);
            }
        }
        
        // Add point establishment
        if (roll.isPointEstablished) {
            notes.push(`Point is ${roll.total}`);
        }
        
        // Add come bet information for progressive come strategy
        if (this.betType === 'progressiveCome') {
            // Check if come bet was placed
            if (roll.description && roll.description.includes('Come bet placed')) {
                const comePoint = roll.description.match(/Come bet placed on (\d+)/);
                if (comePoint) {
                    notes.push(`Come bet placed on ${comePoint[1]}`);
                }
            }
            
            // Check if come bet won
            if (roll.description && roll.description.includes('Come bet') && roll.description.includes('wins')) {
                const comePoint = roll.description.match(/Come bet (\d+) wins/);
                if (comePoint) {
                    notes.push(`Come bet ${comePoint[1]} wins`);
                }
            }
            
            // Check if come bets lost
            if (roll.description && roll.description.includes('Come bets lose')) {
                notes.push('Come bets lose (7 out)');
            }
        }
        
        // Add ruin indicator
        if (roll.isRuin) {
            notes.push('💀 RUIN!');
        }
        
        const notesText = notes.join(', ');
        
        // Calculate payout explanation
        let payoutText = '';
        console.log(`Debug payout: winLoss=${roll.winLoss}, wasComeOutRoll=${roll.wasComeOutRoll}, total=${roll.total}, point=${this.point}`);
        
        // Test: Force a point roll win to see payout calculation
        if (roll.wasComeOutRoll === false && roll.total === this.point && roll.winLoss > 0) {
            console.log('*** POINT ROLL WIN DETECTED ***');
        }
        
        if (roll.winLoss > 0) {
            // Winning bet - explain the payout
            console.log(`Processing win: wasComeOutRoll=${roll.wasComeOutRoll}, total=${roll.total}, point=${this.point}`);
            if (roll.wasComeOutRoll) {
                console.log('Come out roll win');
                if (this.betType === 'pass' || this.betType === 'progressiveCome') {
                    payoutText = `$${this.passLineBet} returns $${this.passLineBet * 2}`;
                } else {
                    payoutText = `$${this.passLineBet} returns $${this.passLineBet * 2}`;
                }
            } else {
                console.log('Point roll win - should show odds bet');
                // Point roll win - show actual dollar amounts
                // For point rolls, we know the total bet includes pass line + odds
                const oddsMultiplier = this.getOddsMultiplierForPoint(roll.total);
                const intendedOddsBet = this.passLineBet * oddsMultiplier;
                const intendedTotalBet = this.passLineBet + intendedOddsBet;
                
                console.log(`Debug: oddsMultiplier=${oddsMultiplier}, intendedOddsBet=${intendedOddsBet}, intendedTotalBet=${intendedTotalBet}, roll.betAmount=${roll.betAmount}`);
                
                // Calculate actual bet amounts
                let actualPassLineBet, actualOddsBet;
                
                if (roll.betAmount < intendedTotalBet) {
                    // Bet was adjusted due to bankroll limits
                    const ratio = roll.betAmount / intendedTotalBet;
                    actualPassLineBet = this.passLineBet * ratio;
                    actualOddsBet = intendedOddsBet * ratio;
                } else {
                    // Full bet was placed
                    actualPassLineBet = this.passLineBet;
                    actualOddsBet = intendedOddsBet;
                }
                
                if (this.betType === 'pass' || this.betType === 'progressiveCome') {
                    let passReturn = actualPassLineBet * 2; // Pass line pays 1:1
                    let oddsReturn = 0;
                    
                    switch (roll.total) {
                        case 4:
                        case 10:
                            oddsReturn = actualOddsBet * 3; // 2:1 odds
                            break;
                        case 5:
                        case 9:
                            oddsReturn = actualOddsBet * 2.5; // 3:2 odds
                            break;
                        case 6:
                        case 8:
                            oddsReturn = actualOddsBet * 2.2; // 6:5 odds
                            break;
                    }
                    
                    console.log(`Debug: actualPassLineBet=${actualPassLineBet}, actualOddsBet=${actualOddsBet}, oddsReturn=${oddsReturn}, payoutText=${payoutText}`);
                    
                    if (actualOddsBet > 0) {
                        payoutText = `$${actualPassLineBet.toFixed(0)} returns $${passReturn.toFixed(0)}, $${actualOddsBet.toFixed(0)} returns $${oddsReturn.toFixed(0)}`;
                    } else {
                        payoutText = `$${actualPassLineBet.toFixed(0)} returns $${passReturn.toFixed(0)}`;
                    }
                } else {
                    let passReturn = actualPassLineBet * 2; // Don't pass pays 1:1
                    let oddsReturn = 0;
                    
                    switch (roll.total) {
                        case 4:
                        case 10:
                            oddsReturn = actualOddsBet * 2; // 1:2 odds
                            break;
                        case 5:
                        case 9:
                            oddsReturn = actualOddsBet * 1.67; // 2:3 odds
                            break;
                        case 6:
                        case 8:
                            oddsReturn = actualOddsBet * 1.83; // 5:6 odds
                            break;
                    }
                    
                    if (actualOddsBet > 0) {
                        payoutText = `$${actualPassLineBet.toFixed(0)} returns $${passReturn.toFixed(0)}, $${actualOddsBet.toFixed(0)} returns $${oddsReturn.toFixed(0)}`;
                    } else {
                        payoutText = `$${actualPassLineBet.toFixed(0)} returns $${passReturn.toFixed(0)}`;
                    }
                }
            }
            
            // Add come bet payout information for progressive come strategy
            if (this.betType === 'progressiveCome' && roll.description) {
                // Handle immediate come bet wins (7/11)
                if (roll.description.includes('Come bet wins (7)') || roll.description.includes('Come bet wins (11)')) {
                    const comeBetAmount = this.passLineBet;
                    const comeBetReturn = comeBetAmount * 2; // Come bet pays 1:1
                    
                    if (payoutText) {
                        payoutText += `, Come: $${comeBetAmount} returns $${comeBetReturn.toFixed(0)}`;
                    } else {
                        payoutText = `Come: $${comeBetAmount} returns $${comeBetReturn.toFixed(0)}`;
                    }
                }
                // Handle come bet point wins
                else if (roll.description.includes('Come bet') && roll.description.includes('wins')) {
                    const comePoint = roll.description.match(/Come bet (\d+) wins/);
                    if (comePoint) {
                        const comePointNum = parseInt(comePoint[1]);
                        const comeBetAmount = this.passLineBet;
                        const comeOddsMultiplier = this.getOddsMultiplierForPoint(comePointNum);
                        const comeOddsAmount = comeBetAmount * comeOddsMultiplier;
                        
                        let comeOddsReturn = 0;
                        switch (comePointNum) {
                            case 4:
                            case 10:
                                comeOddsReturn = comeOddsAmount * 3; // 2:1 odds
                                break;
                            case 5:
                            case 9:
                                comeOddsReturn = comeOddsAmount * 2.5; // 3:2 odds
                                break;
                            case 6:
                            case 8:
                                comeOddsReturn = comeOddsAmount * 2.2; // 6:5 odds
                                break;
                        }
                        
                        const comeBetReturn = comeBetAmount * 2; // Come bet pays 1:1
                        
                        if (payoutText) {
                            payoutText += `, Come: $${comeBetAmount} returns $${comeBetReturn.toFixed(0)}, $${comeOddsAmount} returns $${comeOddsReturn.toFixed(0)}`;
                        } else {
                            payoutText = `Come: $${comeBetAmount} returns $${comeBetReturn.toFixed(0)}, $${comeOddsAmount} returns $${comeOddsReturn.toFixed(0)}`;
                        }
                    }
                }
            }
        } else {
            // No win/loss - don't show payout details
            payoutText = '';
        }
        
        rollElement.innerHTML = `
            <div>${roll.rollNumber}</div>
            <div class="dice-result">${roll.dice}</div>
            <div class="dice-result">${roll.total}</div>
            <div class="bet-amount">$${roll.betAmount.toFixed(2)}</div>
            <div class="${winLossClass}">${roll.winLoss > 0 ? '+' : ''}$${roll.winLoss.toFixed(2)}</div>
            <div class="running-total ${bankrollClass}">$${roll.currentBankroll.toFixed(2)}</div>
            <div class="payout">${payoutText}</div>
            <div class="notes">${notesText}</div>
        `;
        
        document.getElementById('rollHistory').appendChild(rollElement);
    }
    
    updateSummaryStats() {
        // Animate stat updates
        this.animateStatUpdate('totalRolls', this.rollHistory.length);
        this.animateStatUpdate('maxBankroll', `$${this.maxBankroll.toFixed(2)}`);
        this.animateStatUpdate('minBankroll', `$${this.minBankroll.toFixed(2)}`);
        
        const netResultElement = document.getElementById('netResult');
        const netValue = `$${this.runningTotal.toFixed(2)}`;
        
        this.animateStatUpdate('netResult', netValue);
        
        if (this.runningTotal < 0) {
            netResultElement.classList.add('negative');
            netResultElement.classList.remove('positive');
        } else if (this.runningTotal > 0) {
            netResultElement.classList.add('positive');
            netResultElement.classList.remove('negative');
        } else {
            netResultElement.classList.remove('negative', 'positive');
        }
        
        // Add ruin indicator to net result if ruin was reached
        if (this.ruinReached) {
            netResultElement.textContent = `${netValue} 💀 RUIN!`;
            netResultElement.classList.add('ruin');
        }
    }
    
    animateStatUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        element.classList.add('updating');
        element.textContent = newValue;
        
        setTimeout(() => {
            element.classList.remove('updating');
        }, 300);
    }
    
    clearHistory() {
        if (this.isSimulating) return;
        
        // Animate out existing entries
        const entries = document.querySelectorAll('.roll-entry');
        entries.forEach((entry, index) => {
            setTimeout(() => {
                entry.style.opacity = '0';
                entry.style.transform = 'translateX(20px)';
                setTimeout(() => entry.remove(), 200);
            }, index * 50);
        });
        
        // Reset data
        this.point = null;
        this.comeOutPhase = true;
        this.totalBet = 0;
        this.totalWon = 0;
        this.rollHistory = [];
        this.runningTotal = 0;
        this.ruinReached = false;
        this.startingBankroll = parseFloat(document.getElementById('bankroll').value) || 1000;
        this.currentBankroll = this.startingBankroll;
        this.maxBankroll = this.startingBankroll;
        this.minBankroll = this.startingBankroll;
        this.simulationResults = [];
        this.totalSimulations = 0;
        this.winningSimulations = 0;
        this.losingSimulations = 0;
        this.ruinSimulations = 0;
        this.maxProfit = 0;
        
        // Reset come bets
        this.clearAllComeBets();
        
        // Update stats
        setTimeout(() => {
            this.updateSummaryStats();
            this.hideSimulationResults();
        }, entries.length * 50 + 200);
    }
    
    updateTotalSimulationResults() {
        document.getElementById('totalSimulations').textContent = this.totalSimulations;
        document.getElementById('winningSimulations').textContent = this.winningSimulations;
        document.getElementById('losingSimulations').textContent = this.losingSimulations;
        document.getElementById('ruinSimulations').textContent = this.ruinSimulations;
        document.getElementById('maxProfit').textContent = `$${this.maxProfit.toFixed(2)}`;
        
        // Show the total results section
        document.getElementById('totalResultsSection').style.display = 'block';
    }
    
    updateSimulationResultsTable() {
        const tableBody = document.getElementById('simulationResults');
        tableBody.innerHTML = '';
        
        this.simulationResults.forEach(result => {
            const row = document.createElement('div');
            row.className = 'simulation-row';
            
            let profitLossClass = '';
            if (result.endedInRuin) {
                profitLossClass = 'ruin';
            } else if (result.profitLoss > 0) {
                profitLossClass = 'positive';
            } else if (result.profitLoss < 0) {
                profitLossClass = 'negative';
            }
            
            row.innerHTML = `
                <div class="simulation-cell">${result.simulationNumber}</div>
                <div class="simulation-cell">${result.totalRolls}</div>
                <div class="simulation-cell ${profitLossClass}">$${result.profitLoss.toFixed(2)}</div>
                <div class="simulation-cell">$${result.maxBankroll.toFixed(2)}</div>
                <div class="simulation-cell">$${result.minBankroll.toFixed(2)}</div>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Show the simulation results section
        document.getElementById('simulationResultsSection').style.display = 'block';
    }
    
    hideSimulationResults() {
        document.getElementById('totalResultsSection').style.display = 'none';
        document.getElementById('simulationResultsSection').style.display = 'none';
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CrapsSimulator();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
});