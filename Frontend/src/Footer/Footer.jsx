import { FaFacebook, FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="footer sm: p-2 md:flex md:justify-around md:items-center text-white">
      <div className="text-4xl font-semibold ">
        <h1 className="text-5xl font-bold">
          <span className="text-White">Digital</span>{" "}
          <span className="text-blue-500">Healthcare</span>
        </h1>
      </div>
      <div>
        <h1 className="text-xl font-semibold">Location</h1>
        <p className="text-lg font-normal">
          Merul Badda, <br /> Dhaka Bangladesh
        </p>
        <p className="text-lg font-normal">Phone - 01734804733</p>
        <p className="text-lg font-normal">Mail- niazmorshedrafi@gmail.com</p>
      </div>
      <div className="text-xl font-semibold">
        <p>Follow Us</p>
        <div className="flex gap-2">
          <FaFacebook></FaFacebook>
          <FaInstagram></FaInstagram>
          <FaTwitter></FaTwitter>
          <FaGithub></FaGithub>
        </div>
      </div>
      <div>
        <form>
          <h6 className="text-xl font-semibold">Newsletter</h6>
          <fieldset className="form-control">
            <div className="join">
              <input
                type="text"
                placeholder="username@site.com"
                className="input input-bordered join-item"
              />
              <button className="btn btn-primary join-item">Subscribe</button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default Footer;
