class WeatherWidget {
    constructor() {
        this.apiKey = '7f8610f6ac78e89403f9ea5b0be8f759';
        this.elements = {
            location: document.querySelector('.weather-location'),
            temp: document.querySelector('.weather-temp'),
            description: document.querySelector('.weather-description'),
            icon: document.querySelector('.weather-icon')
        };
        this.locationAttempts = 0;
        this.maxAttempts = 3;
    }

    async init() {
        try {
            await this.getLocation();
        } catch (error) {
            console.error('Weather widget initialization failed:', error);
            this.setDefaultLocation();
        }

        // Update every 15 minutes
        setInterval(() => this.init(), 900000);
    }

    setLoadingState() {
        this.elements.location.textContent = 'Loading...';
        this.elements.temp.textContent = '--°C';
        this.elements.description.textContent = 'Please wait...';
    }

    async getLocation() {
        this.setLoadingState();

        try {
            // Try HTML5 Geolocation
            const position = await this.getCurrentPosition();
            await this.fetchWeather(position.coords.latitude, position.coords.longitude);
        } catch (error) {
            console.warn('Geolocation failed:', error);

            try {
                // Try IP-based location
                const ipLocation = await this.getLocationFromIP();
                await this.fetchWeather(ipLocation.latitude, ipLocation.longitude);
            } catch (error) {
                console.warn('IP location failed:', error);

                // Final fallback
                this.setDefaultLocation();
            }
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            const options = {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 300000
            };

            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }

    async getLocationFromIP() {
        // Try multiple IP geolocation services
        const services = [
            'https://ipapi.co/json/',
            'https://ip-api.com/json/',
            'https://api.ipify.org?format=json'
        ];

        for (const service of services) {
            try {
                const response = await fetch(service);
                if (!response.ok) continue;
                const data = await response.json();

                if (data.latitude && data.longitude) {
                    return {
                        latitude: data.latitude,
                        longitude: data.longitude
                    };
                }
            } catch (error) {
                console.warn(`IP location service ${service} failed:`, error);
            }
        }

        throw new Error('All IP location services failed');
    }

    async fetchWeather(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            this.displayWeather(data);
        } catch (error) {
            console.error('Weather fetch failed:', error);
            throw error;
        }
    }

    setDefaultLocation() {
        // Paris coordinates
        this.fetchWeather(48.8566, 2.3522).catch(error => {
            console.error('Default location weather fetch failed:', error);
            this.displayError();
        });
    }

    displayWeather(data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp } = data.main;

        // Add fade-out effect
        Object.values(this.elements).forEach(el => el.style.opacity = '0');

        setTimeout(() => {
            this.elements.location.textContent = name;
            this.elements.icon.style.backgroundImage =
                `url(https://openweathermap.org/img/wn/${icon}@2x.png)`;
            this.elements.temp.textContent = `${Math.round(temp)}°C`;
            this.elements.description.textContent = description;

            // Add fade-in effect
            Object.values(this.elements).forEach(el => el.style.opacity = '1');
        }, 300);
    }

    displayError() {
        this.elements.location.textContent = 'Weather Unavailable';
        this.elements.temp.textContent = '--°C';
        this.elements.description.textContent = 'Please try again later';
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const weatherWidget = new WeatherWidget();
        weatherWidget.init();
    });
} else {
    const weatherWidget = new WeatherWidget();
    weatherWidget.init();
}