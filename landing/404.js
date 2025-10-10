// Back button functionality
function goBack() {
    // Check if there's history to go back to
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // If no history, redirect to home page
        window.location.href = 'landing.html';
    }
}

// Optional: Add keyboard shortcut (Escape key to go back)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        goBack();
    }
});

