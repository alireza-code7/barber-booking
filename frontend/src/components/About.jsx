import heroImg from "../assets/images/baner2.jpg";
export const About=()=>{
    return (
        <div>
            <section className="section" id="about">
        <div className="container">
            <div className="about-grid">
                <div className="about-image-wrapper reveal">
                    <img src={heroImg} alt="درباره آرایشگاه محمد بهمنی" className="about-img"/>
                    <div className="about-experience-badge">
                        <div className="num">+۱۰</div>
                        <div className="txt">سال تجربه حرفه‌ای</div>
                    </div>
                </div>
                <div className="about-content reveal">
                    <h3>ترکیب هنر، دقت و شناختی دقیق از استایل روز</h3>
                    <p>در آرایشگاه محمد بهمنی تلاش می‌کنیم با ترکیب تجربه، دقت و شناخت سبک‌های روز، تجربه‌ای متفاوت از اصلاح و استایل مردانه برای شما ایجاد کنیم.</p>
                
                    
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h4>+۵,۰۰۰</h4>
                            <p>مشتری راضی</p>
                        </div>
                        <div className="stat-item">
                            <h4>۱۰۰٪</h4>
                            <p>تضمین کیفیت</p>
                        </div>
                        <div className="stat-item">
                            <h4>۱۵</h4>
                            <p>افتخار و مدرک</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

        </div>
    )
}