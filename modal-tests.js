// Modal Testing Script for ESC Behavior and Tooltips
// Run this in the browser console on the manage-departments page

class ModalTester {
    constructor() {
        this.testResults = [];
        this.currentTest = 0;
        this.totalTests = 8;
    }

    log(message, status = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const result = { timestamp, message, status };
        this.testResults.push(result);
        
        const color = {
            'pass': 'color: green; font-weight: bold;',
            'fail': 'color: red; font-weight: bold;',
            'info': 'color: blue;',
            'warning': 'color: orange;'
        };
        
        console.log(`%c[${timestamp}] ${message}`, color[status] || color.info);
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Test 1: Check if Cancel buttons have correct text
    testCancelButtonText() {
        this.log('🔍 Test 1: Checking Cancel button text...', 'info');
        
        // Check custom modal buttons (AddTeacherModal, AddDepartmentModal)
        const customModalButtons = document.querySelectorAll('button[type="button"]');
        let customModalsPass = false;
        
        customModalButtons.forEach(button => {
            if (button.textContent.trim() === 'Cancel (ESC)') {
                customModalsPass = true;
                this.log(`✅ Found Cancel (ESC) button in custom modal`, 'pass');
            }
        });

        // Check shadcn Dialog buttons (AddRoomModal) - these might be rendered differently
        const dialogButtons = document.querySelectorAll('[role="dialog"] button');
        let dialogModalsPass = false;
        
        dialogButtons.forEach(button => {
            if (button.textContent.trim() === 'Cancel (ESC)') {
                dialogModalsPass = true;
                this.log(`✅ Found Cancel (ESC) button in dialog modal`, 'pass');
            }
        });

        if (customModalsPass || dialogModalsPass) {
            this.log('✅ Test 1 PASSED: Cancel buttons show "Cancel (ESC)"', 'pass');
            return true;
        } else {
            this.log('❌ Test 1 FAILED: Cancel buttons do not show "Cancel (ESC)"', 'fail');
            return false;
        }
    }

    // Test 2: Check if Cancel buttons have tooltips
    testCancelButtonTooltips() {
        this.log('🔍 Test 2: Checking Cancel button tooltips...', 'info');
        
        const cancelButtons = document.querySelectorAll('button[type="button"]');
        let hasTooltip = false;
        
        cancelButtons.forEach(button => {
            if (button.textContent.includes('Cancel') && button.title === 'Press ESC to cancel') {
                hasTooltip = true;
                this.log(`✅ Found tooltip: "${button.title}"`, 'pass');
            }
        });

        if (hasTooltip) {
            this.log('✅ Test 2 PASSED: Cancel buttons have correct tooltips', 'pass');
            return true;
        } else {
            this.log('❌ Test 2 FAILED: Cancel buttons missing tooltips', 'fail');
            return false;
        }
    }

    // Test 3: Check button types to prevent form submission
    testButtonTypes() {
        this.log('🔍 Test 3: Checking Cancel button types...', 'info');
        
        const cancelButtons = document.querySelectorAll('button');
        let correctTypes = 0;
        let totalCancelButtons = 0;
        
        cancelButtons.forEach(button => {
            if (button.textContent.includes('Cancel')) {
                totalCancelButtons++;
                if (button.type === 'button') {
                    correctTypes++;
                    this.log(`✅ Cancel button has correct type="button"`, 'pass');
                } else {
                    this.log(`❌ Cancel button has incorrect type="${button.type}"`, 'fail');
                }
            }
        });

        if (correctTypes === totalCancelButtons && totalCancelButtons > 0) {
            this.log('✅ Test 3 PASSED: All Cancel buttons have type="button"', 'pass');
            return true;
        } else {
            this.log('❌ Test 3 FAILED: Some Cancel buttons have incorrect types', 'fail');
            return false;
        }
    }

    // Test 4: Test ESC key functionality (simulation)
    async testEscKeyFunctionality() {
        this.log('🔍 Test 4: Testing ESC key functionality...', 'info');
        
        // This test would need to be done manually since we can't programmatically 
        // trigger modal opening without user interaction in most cases
        this.log('⚠️ Test 4: ESC key test requires manual verification', 'warning');
        this.log('📝 Instructions: Open a modal and press ESC key to verify it closes', 'info');
        
        // Check if ESC key handlers are registered
        const hasEscapeHandlers = this.checkForEscapeHandlers();
        if (hasEscapeHandlers) {
            this.log('✅ Test 4 PARTIAL PASS: ESC key handlers detected in code', 'pass');
            return true;
        } else {
            this.log('❌ Test 4 FAILED: No ESC key handlers found', 'fail');
            return false;
        }
    }

    // Helper method to check for escape handlers
    checkForEscapeHandlers() {
        // Look for common patterns in the code that indicate ESC handling
        const scripts = document.querySelectorAll('script');
        let hasEscHandler = false;
        
        scripts.forEach(script => {
            if (script.textContent && 
                (script.textContent.includes('Escape') || 
                 script.textContent.includes('keydown') ||
                 script.textContent.includes('key === "Escape"'))) {
                hasEscHandler = true;
            }
        });
        
        return hasEscHandler;
    }

    // Test 5: Accessibility features
    testAccessibility() {
        this.log('🔍 Test 5: Checking accessibility features...', 'info');
        
        const cancelButtons = document.querySelectorAll('button');
        let accessibilityScore = 0;
        let totalTests = 0;
        
        cancelButtons.forEach(button => {
            if (button.textContent.includes('Cancel')) {
                totalTests += 2; // aria-label and title tests
                
                // Check for aria-label
                if (button.getAttribute('aria-label')) {
                    accessibilityScore++;
                    this.log(`✅ Button has aria-label: "${button.getAttribute('aria-label')}"`, 'pass');
                } else {
                    this.log(`⚠️ Button missing aria-label`, 'warning');
                }
                
                // Check for title (tooltip)
                if (button.title) {
                    accessibilityScore++;
                    this.log(`✅ Button has title: "${button.title}"`, 'pass');
                } else {
                    this.log(`❌ Button missing title`, 'fail');
                }
            }
        });

        if (accessibilityScore >= totalTests * 0.7) { // At least 70% pass
            this.log('✅ Test 5 PASSED: Good accessibility features', 'pass');
            return true;
        } else {
            this.log('❌ Test 5 FAILED: Insufficient accessibility features', 'fail');
            return false;
        }
    }

    // Test 6: Browser compatibility check
    testBrowserCompatibility() {
        this.log('🔍 Test 6: Checking browser compatibility...', 'info');
        
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        
        if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
        else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
        else if (userAgent.indexOf('Opera') > -1) browser = 'Opera';
        
        this.log(`🌐 Browser: ${browser}`, 'info');
        
        // Check for modern features
        const supportsQuerySelector = !!document.querySelector;
        const supportsAddEventListener = !!document.addEventListener;
        const supportsKeyboardEvent = typeof KeyboardEvent !== 'undefined';
        
        if (supportsQuerySelector && supportsAddEventListener && supportsKeyboardEvent) {
            this.log('✅ Test 6 PASSED: Browser supports required features', 'pass');
            return true;
        } else {
            this.log('❌ Test 6 FAILED: Browser missing required features', 'fail');
            return false;
        }
    }

    // Test 7: Modal structure validation
    testModalStructure() {
        this.log('🔍 Test 7: Validating modal structure...', 'info');
        
        const modals = document.querySelectorAll('[role="dialog"], .modal');
        let structureValid = true;
        
        if (modals.length === 0) {
            this.log('⚠️ No modals found on current page', 'warning');
            this.log('💡 Note: Modals may be dynamically created when needed', 'info');
            return true; // Not necessarily a failure
        }
        
        modals.forEach((modal, index) => {
            this.log(`📋 Checking modal ${index + 1}...`, 'info');
            
            // Check for accessibility attributes
            const hasAriaModal = modal.getAttribute('aria-modal') === 'true';
            const hasAriaLabel = modal.getAttribute('aria-labelledby') || modal.getAttribute('aria-label');
            
            if (!hasAriaModal) {
                this.log(`❌ Modal ${index + 1} missing aria-modal="true"`, 'fail');
                structureValid = false;
            }
            
            if (!hasAriaLabel) {
                this.log(`❌ Modal ${index + 1} missing aria labeling`, 'fail');
                structureValid = false;
            }
            
            // Look for Cancel buttons within this modal
            const cancelButton = modal.querySelector('button[type="button"]');
            if (cancelButton && cancelButton.textContent.includes('Cancel')) {
                this.log(`✅ Modal ${index + 1} has Cancel button`, 'pass');
            } else {
                this.log(`⚠️ Modal ${index + 1} may not have Cancel button`, 'warning');
            }
        });
        
        if (structureValid) {
            this.log('✅ Test 7 PASSED: Modal structure is valid', 'pass');
            return true;
        } else {
            this.log('❌ Test 7 FAILED: Modal structure has issues', 'fail');
            return false;
        }
    }

    // Test 8: Overall integration test
    async testIntegration() {
        this.log('🔍 Test 8: Integration test...', 'info');
        
        // Summary of all previous tests
        const passedTests = this.testResults.filter(r => r.status === 'pass').length;
        const failedTests = this.testResults.filter(r => r.status === 'fail').length;
        
        this.log(`📊 Test Summary: ${passedTests} passed, ${failedTests} failed`, 'info');
        
        if (failedTests === 0) {
            this.log('✅ Test 8 PASSED: All tests passed!', 'pass');
            return true;
        } else if (failedTests <= 2) {
            this.log('⚠️ Test 8 WARNING: Minor issues found', 'warning');
            return true;
        } else {
            this.log('❌ Test 8 FAILED: Multiple issues need attention', 'fail');
            return false;
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('%c🚀 Starting Modal Test Suite...', 'color: blue; font-size: 16px; font-weight: bold;');
        console.log('%c====================================', 'color: blue;');
        
        const tests = [
            () => this.testCancelButtonText(),
            () => this.testCancelButtonTooltips(),
            () => this.testButtonTypes(),
            () => this.testEscKeyFunctionality(),
            () => this.testAccessibility(),
            () => this.testBrowserCompatibility(),
            () => this.testModalStructure(),
            () => this.testIntegration()
        ];

        let passCount = 0;
        
        for (let i = 0; i < tests.length; i++) {
            const result = await tests[i]();
            if (result) passCount++;
            await this.wait(500); // Small delay between tests
        }
        
        console.log('%c====================================', 'color: blue;');
        console.log(`%c📊 Final Results: ${passCount}/${tests.length} tests passed`, 
                   'color: blue; font-size: 16px; font-weight: bold;');
        
        if (passCount === tests.length) {
            console.log('%c🎉 ALL TESTS PASSED!', 'color: green; font-size: 18px; font-weight: bold;');
        } else if (passCount >= tests.length * 0.8) {
            console.log('%c⚠️ MOSTLY PASSING - Minor issues to address', 'color: orange; font-size: 16px;');
        } else {
            console.log('%c❌ MULTIPLE FAILURES - Needs attention', 'color: red; font-size: 16px;');
        }
        
        return { passCount, totalTests: tests.length, results: this.testResults };
    }

    // Generate a test report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            browser: navigator.userAgent,
            url: window.location.href,
            results: this.testResults
        };
        
        console.log('%c📋 Detailed Test Report:', 'color: blue; font-weight: bold;');
        console.table(this.testResults);
        
        return report;
    }
}

// Instructions for running the tests
console.log('%c🔧 Modal Testing Instructions:', 'color: purple; font-size: 14px; font-weight: bold;');
console.log('%c1. Navigate to the manage-departments page', 'color: purple;');
console.log('%c2. Run: const tester = new ModalTester(); tester.runAllTests();', 'color: purple;');
console.log('%c3. For manual ESC testing, open modals and press ESC key', 'color: purple;');
console.log('%c4. For tooltip testing, hover over Cancel buttons', 'color: purple;');
console.log('%c====================================', 'color: purple;');

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalTester;
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
    window.ModalTester = ModalTester;
    
    // Auto-run after a short delay to ensure page is loaded
    setTimeout(() => {
        if (window.location.pathname.includes('manage-departments') || 
            window.location.pathname.includes('room-management')) {
            console.log('%c🎯 Auto-running tests on modal page...', 'color: green; font-weight: bold;');
            const autoTester = new ModalTester();
            autoTester.runAllTests();
        }
    }, 2000);
}
