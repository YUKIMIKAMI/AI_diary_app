// Node.js script for cross-platform completion notification
const player = require('play-sound')();
const notifier = require('node-notifier');
const path = require('path');

// Function to play completion sound
function playCompletionSound() {
    // Windows default sound
    if (process.platform === 'win32') {
        player.play('C:\\Windows\\Media\\chimes.wav', (err) => {
            if (err) console.log('Could not play sound:', err);
        });
    } else if (process.platform === 'darwin') {
        // macOS
        player.play('/System/Library/Sounds/Glass.aiff', (err) => {
            if (err) console.log('Could not play sound:', err);
        });
    } else {
        // Linux - use system beep
        console.log('\u0007');
    }
}

// Function to show desktop notification
function showNotification(title, message) {
    notifier.notify({
        title: title || 'AI Diary App',
        message: message || 'Task completed successfully!',
        icon: path.join(__dirname, '../assets/icon.png'), // optional
        sound: true,
        wait: false
    });
}

// Export functions
module.exports = {
    playCompletionSound,
    showNotification,
    notifyCompletion: function(taskName) {
        const message = `✅ ${taskName || 'Task'} completed!`;
        console.log(message);
        playCompletionSound();
        showNotification('Task Complete', message);
    }
};

// Run if called directly
if (require.main === module) {
    const taskName = process.argv[2] || 'Task';
    module.exports.notifyCompletion(taskName);
}