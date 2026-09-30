import { useServices } from "../contexts/ServicesContext";

export const GetServices = () => {
  const { services } = useServices();

  return (
    <section className="section" id="services">
      <div className="container">

        <div className="section-header reveal">
          <h2 className="section-title">
            خدمات ما
          </h2>

        
        </div>

        <div className="services-grid">

          {services.map((service) => {
           
            
            
            return (
              <div
                className="service-card reveal"
                key={service.id}
              >

                <div className="service-icon-wrapper">
                  <i className={service.icon || "fas fa-cut"}></i>
                </div>

                <h3 className="service-name">
                  {service.title}
                </h3>

                <p className="service-desc">
                  {service.description}
                </p>

                <div className="service-footer">
                  <span className="service-price">
                    {Number(service.price).toLocaleString("fa-IR")}تومان
                   
                  </span>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
};

   

    
