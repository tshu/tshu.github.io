// Get the modal
var findEDModal = document.getElementById('findEDModal');

// Get the button that opens the modal
var findEDButton = document.getElementById("findEDButton");

var topBar = document.getElementById("topBar");

// When the user clicks on the button, open the modal 
findEDButton.onclick = function() {
    findEDModal.style.display = "block";
    topBar.style.backgroundColor = "rgba(255,255,255,0.0)";
}

findEDModal.onclick = function() {
	findEDModal.style.display = "none";
	topBar.style.backgroundColor = "rgba(255,255,255,1)";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == findEDModal) {
        findEDModal.style.display = "none";
        topBar.style.backgroundColor = "rgba(255,255,255,1)";
    }
    if (event.target == amproModal) {
        amproModal.style.display = "none";
        topBar.style.backgroundColor = "rgba(255,255,255,1)";
    }
    if (event.target == recapModal) {
        recapModal.style.display = "none";
        topBar.style.backgroundColor = "rgba(255,255,255,1)";
    }
    if (event.target == banditModal) {
        banditModal.style.display = "none";
        topBar.style.backgroundColor = "rgba(255,255,255,1)";
    }
    if (event.target == dmlsModal) {
        dmlsModal.style.display = "none";
        topBar.style.backgroundColor = "rgba(255,255,255,1)";
    }
}
// 
var amproModal = document.getElementById('amproModal');
var amproButton = document.getElementById("amproButton");

amproButton.onclick = function() {
    amproModal.style.display = "block";
    topBar.style.backgroundColor = "rgba(255,255,255,0.0)";
}

amproModal.onclick = function() {
	amproModal.style.display = "none";
	topBar.style.backgroundColor = "rgba(255,255,255,1)";
}
// 
var recapModal = document.getElementById('recapModal');
var recapButton = document.getElementById("recapButton");

recapButton.onclick = function() {
    recapModal.style.display = "block";
    topBar.style.backgroundColor = "rgba(255,255,255,0.0)";
}

recapModal.onclick = function() {
	recapModal.style.display = "none";
	topBar.style.backgroundColor = "rgba(255,255,255,1)";
}
//
var banditModal = document.getElementById('banditModal');
var banditButton = document.getElementById("banditButton");

banditButton.onclick = function() {
    banditModal.style.display = "block";
    topBar.style.backgroundColor = "rgba(255,255,255,0.0)";
}

banditModal.onclick = function() {
	banditModal.style.display = "none";
	topBar.style.backgroundColor = "rgba(255,255,255,1)";
}
//
var dmlsModal = document.getElementById('dmlsModal');
var dmlsButton = document.getElementById("dmlsButton");

dmlsButton.onclick = function() {
    dmlsModal.style.display = "block";
    topBar.style.backgroundColor = "rgba(255,255,255,0.0)";
}

dmlsModal.onclick = function() {
	dmlsModal.style.display = "none";
	topBar.style.backgroundColor = "rgba(255,255,255,1)";
}