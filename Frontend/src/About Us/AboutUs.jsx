import { Helmet } from "react-helmet";
import Footer from "../Footer/Footer";

const AboutUs = () => {
  return (
    <div className="mt-12">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{"About Us"} | Digital Healthcare</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <div className="flex justify-center items-center">
        <div
          data-aos="zoom-in"
          data-aos-duration="3000"
          className=" card w-96 bg-base-100 shadow-xl"
        >
          <figure>
            <img
              style={{ height: "400px", width: "400px" }}
              src={"https://i.ibb.co.com/QF5J6t2k/487299409-1409764517050212-2019707219676933220-n.jpg"}
            />
          </figure>
          <div className="card-body">
            <h1 className="text-4xl font-bold text-center">Yasha Ehtesham</h1>
            <p className="text-base font-semibold text-start">
              As the CEO of our esteemed establishment, I am thrilled to extend
              a warm and heartfelt greeting to each and every guest who graces
              our website. Thank you for considering Digital Healthcare for your Choice
              <br /> Warm regards...
            </p>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default AboutUs;
