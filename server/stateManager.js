let globalHistory = []; 

function addStroke(stroke) {
    globalHistory.push(stroke);
}

function getHistory() {
    return globalHistory;
}

function undoLastUserAction(userId) {
    // Find the strokeId of the very last action this user performed
    let targetStrokeId = null;
    
    // Loop backwards to find the most recent action by this user
    for (let i = globalHistory.length - 1; i >= 0; i--) {
        if (globalHistory[i].userId === userId) {
            targetStrokeId = globalHistory[i].strokeId;
            break; // Found the last stroke, stop looking
        }
    }

    if (!targetStrokeId) return false; // User has no history to undo

    //  Remove ALL segments that match that strokeId
    const initialLength = globalHistory.length;
    
    // Keep only the items that DO NOT match the target ID
    globalHistory = globalHistory.filter(item => item.strokeId !== targetStrokeId);

    // Return true if we actually removed something
    return globalHistory.length < initialLength;
}

module.exports = { addStroke, getHistory, undoLastUserAction };