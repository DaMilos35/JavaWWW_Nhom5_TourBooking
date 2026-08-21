import os

homepage_css = '''
.homepage {
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Hero Section with Beautiful Image and Overlay */
.hero-section {
  position: relative;
  height: 550px;
  background: url('https://images.unsplash.com/photo-1557409518-691ebcd96038?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-top: -80px; /* Pull up under transparent navbar if needed, or just let it be */
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 900px;
  padding: 0 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 15px;
  text-shadow: 2px 4px 10px rgba(0,0,0,0.5);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 40px;
  text-shadow: 1px 2px 4px rgba(0,0,0,0.5);
}

/* Search Widget (Traveloka Style) */
.search-widget-container {
  display: flex;
  justify-content: center;
  transform: translateY(20px);
}

.search-widget {
  display: flex;
  background: white;
  padding: 10px;
  border-radius: 50px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 700px;
}

.search-input-group {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 20px;
  gap: 15px;
}

.search-icon {
  color: #ff5722;
  font-size: 1.2rem;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.1rem;
  color: #333;
  background: transparent;
  padding: 10px 0;
}

.search-input::placeholder {
  color: #999;
}

.search-btn {
  background: #ff5722;
  color: white;
  border: none;
  border-radius: 40px;
  padding: 15px 35px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(255, 87, 34, 0.4);
}

.search-btn:hover {
  background: #e64a19;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 87, 34, 0.5);
}

/* Categories Section */
.categories-section {
  padding: 80px 20px 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-header p {
  color: #666;
  font-size: 1.1rem;
}

.category-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.category-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  position: relative;
  display: block;
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.category-img-wrapper {
  position: relative;
  height: 250px;
}

.category-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-card:hover .category-img {
  transform: scale(1.1);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%);
  display: flex;
  align-items: flex-end;
  padding: 25px;
}

.category-overlay h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 1px 2px 4px rgba(0,0,0,0.5);
}

/* Featured Tours */
.featured-tours-section {
  padding: 60px 0;
  background: white;
}

.btn-view-all {
  display: inline-block;
  padding: 12px 30px;
  background: white;
  color: #ff5722;
  border: 2px solid #ff5722;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-view-all:hover {
  background: #ff5722;
  color: white;
  box-shadow: 0 5px 15px rgba(255, 87, 34, 0.3);
}

/* Features/Why Choose Us Section */
.features-section {
  padding: 80px 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-box {
  background: white;
  padding: 40px 25px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.feature-box:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  background: #fff3e0;
  color: #ff5722;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
}

.feature-box:hover .feature-icon-wrapper {
  background: #ff5722;
  color: white;
  transform: scale(1.1) rotate(5deg);
}

.feature-box h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 15px;
}

.feature-box p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Responsive Adjustments */
@media screen and (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .search-widget {
    flex-direction: column;
    border-radius: 20px;
    padding: 20px;
    gap: 15px;
  }
  
  .search-input-group {
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  
  .search-btn {
    width: 100%;
    justify-content: center;
    border-radius: 10px;
  }
}
'''

with open('src/pages/HomePage.css', 'w', encoding='utf-8') as f:
    f.write(homepage_css)

print("Created HomePage.css")
