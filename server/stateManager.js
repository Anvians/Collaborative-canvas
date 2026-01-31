let globalHistory = [];

function addStroke(stroke) {
    globalHistory.push(stroke);
}

function getHistory() {
    return globalHistory;
}

// Global Undo: Removes the most recent strokeId, regardless of who drew it
function undoLastAction() {
    if (globalHistory.length === 0) return false;

    // Get the ID of the very last segment added
    const lastStrokeId = globalHistory[globalHistory.length - 1].strokeId;

    // Remove ALL segments matching that ID (to remove the whole line)
    const initialLength = globalHistory.length;
    globalHistory = globalHistory.filter(item => item.strokeId !== lastStrokeId);

    return globalHistory.length < initialLength;
}

function clearHistory() {
    globalHistory = [];
}

module.exports = { addStroke, getHistory, undoLastAction, clearHistory };