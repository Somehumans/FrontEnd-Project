document.addEventListener('DOMContentLoaded', function() {
    // Create particle effect
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < 120; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        const size = Math.random() * 5 + 2;
        
        particle.style.position = 'absolute';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = 'rgba(255, 255, 255, 0.7)';
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 ' + size + 'px rgba(255, 255, 255, 0.7)';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Animation
        particle.style.animation = `float ${Math.random() * 3 + 2}s linear infinite`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Button click effect
    const playButton = document.getElementById('playButton');
    
    playButton.addEventListener('click', function() {
        playButton.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            playButton.style.transform = 'scale(1.05)';
            alert('Starting game...');
            // Here you would redirect to the actual game
            // window.location.href = 'game.html';
        }, 100);
    });
});