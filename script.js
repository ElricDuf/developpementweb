// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '70px';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.backgroundColor = 'white';
            navMenu.style.gap = '0';
            navMenu.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            navMenu.style.padding = '20px';
            navMenu.style.zIndex = '99';
        });
    }

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Only collapse the menu on mobile after navigation.
            if (navMenu && window.innerWidth <= 768) {
                navMenu.style.display = 'none';
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formMessage = document.getElementById('formMessage');
            const formData = new FormData(contactForm);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    formMessage.textContent = 'Merci ! Votre message a été envoyé avec succès. Je vous recontacterai très bientôt.';
                    formMessage.classList.add('success');
                    formMessage.classList.remove('error');
                    contactForm.reset();
                    setTimeout(() => {
                        formMessage.classList.remove('success');
                        formMessage.textContent = '';
                    }, 5000);
                } else {
                    throw new Error('Erreur lors de l\'envoi');
                }
            })
            .catch(error => {
                formMessage.textContent = 'Une erreur est survenue. Veuillez réessayer ou me contacter directement.';
                formMessage.classList.add('error');
                formMessage.classList.remove('success');
                setTimeout(() => {
                    formMessage.classList.remove('error');
                    formMessage.textContent = '';
                }, 5000);
            });
        });
    }

    // Add animation on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe service cards and portfolio items
    document.querySelectorAll('.service-card, .portfolio-item').forEach(el => {
        observer.observe(el);
    });
});

// Add css animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .service-card, .portfolio-item, .why-item {
        opacity: 0;
    }
`;
document.head.appendChild(style);

// Add active link highlighting
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = 'var(--primary-color)';
        } else {
            link.style.color = 'var(--dark-color)';
        }
    });
});
