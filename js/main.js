// ==========================================================================
// Main JavaScript for JustCloud.pl Landing Page
// ==========================================================================

(function () {
    'use strict';

    // Skeleton animation control for all lazy images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    let scrollTimer = null;
    const activateSkeletons = () => lazyImages.forEach(img => img.classList.add('skeleton-active'));
    const deactivateSkeletons = () => lazyImages.forEach(img => img.classList.remove('skeleton-active'));
    const onScroll = () => {
        activateSkeletons();
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(deactivateSkeletons, 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial state: deactivate
    deactivateSkeletons();

    // ==========================================================================
    // Dark Mode Toggle
    // ==========================================================================

    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const mobileDarkIcon = document.getElementById('mobile-theme-toggle-dark-icon');
    const mobileLightIcon = document.getElementById('mobile-theme-toggle-light-icon');
    const html = document.documentElement;

    // Check for saved theme preference or default to system preference
    const getThemePreference = () => {
        if (localStorage.getItem('theme')) {
            return localStorage.getItem('theme');
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Set theme
    const setTheme = (theme) => {
        if (theme === 'dark') {
            html.classList.add('dark');
            darkIcon?.classList.remove('hidden');
            lightIcon?.classList.add('hidden');
            mobileDarkIcon?.classList.remove('hidden');
            mobileLightIcon?.classList.add('hidden');
        } else {
            html.classList.remove('dark');
            darkIcon?.classList.add('hidden');
            lightIcon?.classList.remove('hidden');
            mobileDarkIcon?.classList.add('hidden');
            mobileLightIcon?.classList.remove('hidden');
        }
        localStorage.setItem('theme', theme);
    };

    // Initialize theme
    const currentTheme = getThemePreference();
    setTheme(currentTheme);

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = html.classList.contains('dark') ? 'light' : 'dark';
        setTheme(newTheme);
    };

    // Event listeners
    themeToggleBtn?.addEventListener('click', toggleTheme);
    mobileThemeToggleBtn?.addEventListener('click', toggleTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // ==========================================================================
    // Mobile Menu Toggle with Animated Hamburger
    // ==========================================================================

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerLine1 = document.getElementById('hamburger-line-1');
    const hamburgerLine2 = document.getElementById('hamburger-line-2');
    const hamburgerLine3 = document.getElementById('hamburger-line-3');
    
    let isMobileMenuOpen = false;

    const toggleMobileMenu = () => {
        isMobileMenuOpen = !isMobileMenuOpen;
        
        if (isMobileMenuOpen) {
            // Open menu
            mobileMenu?.classList.remove('max-h-0', 'opacity-0');
            mobileMenu?.classList.add('max-h-screen', 'opacity-100');
            
            // Animate hamburger to X
            hamburgerLine1?.classList.add('rotate-45', 'translate-y-2');
            hamburgerLine2?.classList.add('opacity-0');
            hamburgerLine3?.classList.add('-rotate-45', '-translate-y-2');
        } else {
            // Close menu
            mobileMenu?.classList.remove('max-h-screen', 'opacity-100');
            mobileMenu?.classList.add('max-h-0', 'opacity-0');
            
            // Animate X back to hamburger
            hamburgerLine1?.classList.remove('rotate-45', 'translate-y-2');
            hamburgerLine2?.classList.remove('opacity-0');
            hamburgerLine3?.classList.remove('-rotate-45', '-translate-y-2');
        }
    };

    mobileMenuButton?.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking on a link and handle scrolling
    const mobileNavLinks = mobileMenu?.querySelectorAll('.mobile-nav-link');
    mobileNavLinks?.forEach(link => {
        link.addEventListener('click', (e) => {
            if (isMobileMenuOpen) {
                // Prevent default link behavior
                e.preventDefault();
                
                // Get the target section
                const targetId = link.getAttribute('href');
                
                // Close menu first
                toggleMobileMenu();
                
                // Wait for menu animation to complete, then scroll
                setTimeout(() => {
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        // Calculate offset (only header height, no extra space)
                        // Use fixed height since menu is now closed
                        const headerHeight = 80; // Fixed header height on mobile
                        const totalOffset = headerHeight; // No extra offset for professional look
                        
                        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - totalOffset;
                        
                        window.scrollTo({
                            top: Math.max(0, targetPosition),
                            behavior: 'smooth'
                        });
                        
                        // Update URL
                        if (history.pushState) {
                            history.pushState(null, null, targetId);
                        }
                    }
                }, 300); // Match menu animation duration
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMobileMenuOpen && !mobileMenuButton?.contains(e.target) && !mobileMenu?.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // ==========================================================================
    // Cookie Consent & Google Analytics Management (GDPR/RODO Compliant)
    // ==========================================================================

    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept');
    const cookieRejectBtn = document.getElementById('cookie-reject');
    const cookieSettingsFooter = document.getElementById('cookie-settings-footer');

    // Google Analytics ID - replace with your actual GA4 ID
    const GA_MEASUREMENT_ID = 'G-T278Y9D28E'; // TODO: Replace with actual GA4 ID

    // Cookie management functions
    const CookieConsent = {
        COOKIE_NAME: 'jc_cookie_consent',
        EXPIRY_DAYS: 365,

        // Set cookie with expiry
        setCookie(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
        },

        // Get cookie value
        getCookie(name) {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },

        // Check if user has already made a choice
        hasConsent() {
            return this.getCookie(this.COOKIE_NAME) !== null;
        },

        // Check if analytics are enabled
        analyticsEnabled() {
            return this.getCookie(this.COOKIE_NAME) === 'analytics';
        },

        // Save user choice
        saveConsent(allowAnalytics) {
            const value = allowAnalytics ? 'analytics' : 'essential';
            this.setCookie(this.COOKIE_NAME, value, this.EXPIRY_DAYS);
        },

        // Initialize Google Analytics
        initGoogleAnalytics() {
            if (!this.analyticsEnabled()) {
                console.log('📊 Google Analytics: Disabled (no user consent)');
                return;
            }

            // Update consent mode (important for returning users)
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                });
            }

            // Load Google Analytics script
            const script1 = document.createElement('script');
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
            document.head.appendChild(script1);

            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            window.gtag = gtag;
            
            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID, {
                'anonymize_ip': true,
                'cookie_flags': 'SameSite=Lax;Secure'
            });

            console.log('📊 Google Analytics: Enabled');
        },

        // Show cookie banner
        showBanner() {
            if (cookieBanner) {
                cookieBanner.classList.remove('hidden');
                setTimeout(() => {
                    cookieBanner.style.transform = 'translateY(0)';
                }, 100);
            }
        },

        // Hide cookie banner
        hideBanner() {
            if (cookieBanner) {
                cookieBanner.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    cookieBanner.classList.add('hidden');
                }, 300);
            }
        },

        // Accept analytics cookies
        acceptAnalytics() {
            this.saveConsent(true);
            this.hideBanner();

            // Update consent mode
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                });
            }

            this.initGoogleAnalytics();
            console.log('✅ Cookies accepted: Analytics enabled');
        },

        // Reject analytics cookies (only essential)
        rejectAnalytics() {
            this.saveConsent(false);
            this.hideBanner();
            console.log('❌ Cookies rejected: Only essential cookies active');
        },

        // Initialize consent system
        init() {
            // Check if user needs to see banner
            if (!this.hasConsent()) {
                // Show banner after short delay
                setTimeout(() => {
                    this.showBanner();
                }, 1000);
            } else {
                // User has already made choice - initialize GA if allowed
                this.initGoogleAnalytics();
            }

            // Accept button
            cookieAcceptBtn?.addEventListener('click', () => {
                this.acceptAnalytics();
            });

            // Reject button
            cookieRejectBtn?.addEventListener('click', () => {
                this.rejectAnalytics();
            });

            // Settings button in footer - show banner again
            cookieSettingsFooter?.addEventListener('click', () => {
                this.showBanner();
            });

            // Handle URL hash for cookie settings
            if (window.location.hash === '#cookie-settings') {
                this.showBanner();
                // Remove hash from URL without page reload
                history.replaceState(null, null, ' ');
            }
        }
    };

    // Initialize cookie consent system
    CookieConsent.init();

    // ==========================================================================
    // Header Scroll Effect
    // ==========================================================================

    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add scrolled class when scrolling down
        if (scrollTop > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // Smooth Scroll with Offset for Fixed Header
    // ==========================================================================

    document.querySelectorAll('a[href^="#"]:not(.mobile-nav-link)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') return;

            e.preventDefault();

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = header?.offsetHeight || 80;
                // No extra offset for professional look
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });

                // Update URL without scrolling
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        });
    });

    // ==========================================================================
    // Parallax Effect for Hero Background (Optional - can be disabled for performance)
    // ==========================================================================

    const heroSection = document.getElementById('hero');
    const heroImage = heroSection?.querySelector('.hero-bg');

    if (heroImage && window.innerWidth > 768) {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.3;
                    if (heroImage && scrolled < window.innerHeight) {
                        heroImage.style.transform = `translate3d(0, ${rate}px, 0) scale(1.1)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ==========================================================================
    // Intersection Observer for Animations
    // ==========================================================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // ==========================================================================
    // Form Validation Enhancement
    // ==========================================================================

    const contactForm = document.querySelector('form[action*="formspree"]');

    contactForm?.addEventListener('submit', (e) => {
        const emailInput = contactForm.querySelector('input[type="email"]');
        const messageTextarea = contactForm.querySelector('textarea');

        // Basic validation
        if (!emailInput?.value || !messageTextarea?.value) {
            e.preventDefault();
            alert('Proszę wypełnić wszystkie pola formularza.');
            return;
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
            e.preventDefault();
            alert('Proszę podać poprawny adres email.');
            return;
        }
    });

    // ==========================================================================
    // External Links - Open in New Tab
    // ==========================================================================

    document.querySelectorAll('a[href^="http"]').forEach(link => {
        // Skip if already has target attribute
        if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // ==========================================================================
    // Loading State Management
    // ==========================================================================

    window.addEventListener('load', () => {
        // Remove preload class to enable transitions
        document.body.classList.remove('preload');

        // Lazy load images
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    });

    // ==========================================================================
    // Keyboard Navigation Enhancement
    // ==========================================================================

    // Escape key to close mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            mobileMenu?.classList.add('hidden');
        }
    });

    // ==========================================================================
    // Performance Monitoring (Optional)
    // ==========================================================================

    if ('PerformanceObserver' in window) {
        try {
            // Observe Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Observe First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Observe Cumulative Layout Shift (CLS)
            let clsScore = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsScore += entry.value;
                    }
                }
                console.log('CLS:', clsScore);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            // Performance observer not supported
            console.log('Performance monitoring not available');
        }
    }

    // ==========================================================================
    // Service Worker Registration (Optional - for PWA)
    // ==========================================================================

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Uncomment to enable service worker
            // navigator.serviceWorker.register('/sw.js')
            //     .then(registration => console.log('SW registered:', registration))
            //     .catch(error => console.log('SW registration failed:', error));
        });
    }

    // ==========================================================================
    // Analytics Event Tracking (Placeholder)
    // ==========================================================================

    const trackEvent = (category, action, label) => {
        // Placeholder for analytics tracking
        // Example: Google Analytics, Plausible, etc.
        console.log('Event:', category, action, label);

        // Example for Google Analytics 4:
        // if (typeof gtag !== 'undefined') {
        //     gtag('event', action, {
        //         'event_category': category,
        //         'event_label': label
        //     });
        // }
    };

    // Track CTA clicks
    document.querySelectorAll('.cta-button-primary, .cta-button-secondary').forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('CTA', 'Click', button.textContent.trim());
        });
    });

    // Track form submission
    contactForm?.addEventListener('submit', () => {
        trackEvent('Form', 'Submit', 'Contact Form');
    });

    // Track video plays
    document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
        iframe.addEventListener('load', () => {
            trackEvent('Video', 'Load', iframe.src);
        });
    });

    // ==========================================================================
    // IT Feeds Days Counter (triggered on section visibility)
    // ==========================================================================

    const daysCounter = document.getElementById('days-counter');
    
    if (daysCounter) {
        let hasAnimated = false;
        
        const animateDaysCounter = () => {
            if (hasAnimated) return; // Animate only once
            hasAnimated = true;
            
            // Project start date: March 29, 2024
            const startDate = new Date('2024-03-29');
            const today = new Date();
            
            // Calculate difference in days
            const diffTime = Math.abs(today - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Animated counter effect
            const duration = 2000; // 2 seconds
            const frameRate = 60; // frames per second
            const totalFrames = (duration / 1000) * frameRate;
            const increment = diffDays / totalFrames;
            
            let currentCount = 0;
            let frame = 0;
            
            const counterAnimation = setInterval(() => {
                frame++;
                currentCount += increment;
                
                if (frame >= totalFrames) {
                    currentCount = diffDays;
                    clearInterval(counterAnimation);
                }
                
                daysCounter.textContent = Math.floor(currentCount);
            }, 1000 / frameRate);
        };
        
        // Observe IT Feeds section
        const itFeedsSection = document.getElementById('itfeeds');
        if (itFeedsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateDaysCounter();
                    }
                });
            }, {
                threshold: 0.3 // Trigger when 30% of section is visible
            });
            
            observer.observe(itFeedsSection);
        }
    }

    // ==========================================================================
    // Blog RSS Feed
    // ==========================================================================

    const loadBlogPosts = async () => {
        const container = document.getElementById('blog-posts-container');
        const errorContainer = document.getElementById('blog-error');

        try {
            // Pobieramy RSS bezpośrednio i parsujemy XML
            const response = await fetch('https://blog.justcloud.pl/rss.xml');
            
            if (!response.ok) {
                throw new Error('Failed to fetch RSS feed');
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Sprawdzamy czy są błędy parsowania
            if (xmlDoc.querySelector('parsererror')) {
                throw new Error('Error parsing RSS feed');
            }

            const items = xmlDoc.querySelectorAll('item');
            
            if (items.length === 0) {
                throw new Error('No blog posts found');
            }

            // Clear loading state
            container.innerHTML = '';

            // Render first 3 blog posts
            Array.from(items).slice(0, 3).forEach((item) => {
                const post = parseRSSItem(item);
                const postCard = createBlogPostCard(post);
                container.innerHTML += postCard;
            });

        } catch (error) {
            console.error('Error loading blog posts:', error);
            container.innerHTML = '';
            errorContainer.classList.remove('hidden');
        }
    };

    const parseRSSItem = (item) => {
        const getTextContent = (tagName) => {
            const element = item.querySelector(tagName);
            return element ? element.textContent : '';
        };

        const getImageFromContent = () => {
            const content = item.querySelector('content\\:encoded, encoded');
            if (content) {
                const imgMatch = content.textContent.match(/<img[^>]+src="([^">]+)"/);
                return imgMatch ? imgMatch[1] : null;
            }
            return null;
        };

        const categories = Array.from(item.querySelectorAll('category')).map(cat => cat.textContent);

        return {
            title: getTextContent('title'),
            link: getTextContent('link'),
            description: getTextContent('description'),
            pubDate: getTextContent('pubDate'),
            image: getImageFromContent(),
            categories: categories
        };
    };

    const createBlogPostCard = (post) => {
        // Use extracted image or default logo
        const image = post.image || 'img/logo.png';
        
        // Clean description (already plain text from RSS)
        const cleanDescription = post.description.substring(0, 150) + '...' || '';
        
        // Get first 3 tags
        const tags = post.categories.slice(0, 3);
        
        // Format date
        const postDate = new Date(post.pubDate);
        const formattedDate = postDate.toLocaleDateString('pl-PL', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return `
            <article class="blog-post-card bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-2xl dark:hover:shadow-gray-900/80 transition-all duration-300 flex flex-col border border-transparent dark:border-gray-800">
                <!-- Image -->
                <div class="relative w-full h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <img src="${image}" 
                         alt="${post.title}" 
                         class="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                         loading="lazy"
                         onerror="this.src='img/logo.png'">
                </div>
                
                <!-- Content -->
                <div class="p-6 flex-1 flex flex-col">
                    <!-- Date -->
                    <time class="text-sm text-gray-500 dark:text-gray-400 mb-2">${formattedDate}</time>
                    
                    <!-- Title -->
                    <h3 class="font-space-mono text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 hover:text-jc-blue-600 dark:hover:text-jc-blue-400 transition-colors">
                        <a href="${post.link}" target="_blank" rel="noopener noreferrer">
                            ${post.title}
                        </a>
                    </h3>
                    
                    <!-- Description -->
                    <p class="text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-3">
                        ${cleanDescription}
                    </p>
                    
                    <!-- Tags -->
                    ${tags.length > 0 ? `
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${tags.map(tag => `
                            <span class="px-3 py-1 text-xs font-medium bg-jc-blue-100 dark:bg-jc-blue-900/30 text-jc-blue-700 dark:text-jc-blue-300 rounded-full">
                                ${tag}
                            </span>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    <!-- Read More Link -->
                    <a href="${post.link}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="inline-flex items-center text-jc-blue-600 dark:text-jc-blue-400 hover:text-jc-blue-700 dark:hover:text-jc-blue-300 font-semibold transition-colors group">
                        Czytaj więcej
                        <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </a>
                </div>
            </article>
        `;
    };

    // Load blog posts when DOM is ready
    if (document.getElementById('blog-posts-container')) {
        loadBlogPosts();
    }

    // ==========================================================================
    // Console Welcome Message
    // ==========================================================================
    // ==========================================================================
    // YouTube Video Titles Loader
    // ==========================================================================

    async function loadYouTubeTitles() {
        const videoElements = document.querySelectorAll('[data-video-id]');
        
        for (const element of videoElements) {
            const videoId = element.getAttribute('data-video-id');
            if (!videoId) continue;
            
            try {
                // Use oEmbed API to get video title - no API key needed
                const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
                
                if (response.ok) {
                    const data = await response.json();
                    element.textContent = data.title || 'Prezentacja';
                } else {
                    element.textContent = 'Prezentacja';
                }
            } catch (error) {
                console.warn(`Nie udało się załadować tytułu dla wideo ${videoId}:`, error);
                element.textContent = 'Prezentacja';
            }
        }
    }

    // Load YouTube titles when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadYouTubeTitles);
    } else {
        loadYouTubeTitles();
    }

    // ==========================================================================
    // Console Welcome Message
    // ==========================================================================

    console.log(
        '%c🚀 JustCloud.pl',
        'color: #00A7E4; font-size: 24px; font-weight: bold; font-family: "Space Mono", monospace;'
    );
    console.log(
        '%cAutomatyzacja i Optymalizacja Infrastruktury w Chmurze Microsoft Azure',
        'color: #6b7280; font-size: 14px;'
    );
    console.log(
        '%cZainteresowany współpracą? Skontaktuj się: https://justcloud.pl/#contact',
        'color: #00A7E4; font-size: 12px;'
    );

})();