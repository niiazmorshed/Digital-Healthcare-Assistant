import Lottie from "lottie-react";
import { Helmet } from "react-helmet";
import { IoStarSharp } from "react-icons/io5";
import review from "../../public/fnaljson.json";
import Footer from "../Footer/Footer";

const Review = () => {
  return (
    <div className="md: flex flex-col justify-center items-center">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{"Review"} | Digital Healthcare</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <div className="md: w-[700px] ">
        <Lottie animationData={review} loop={true}></Lottie>
      </div>
      {/* Card --- */}
      <div
        data-aos="fade-up"
        data-aos-duration="2000"
        className="md: grid md:grid-cols-3 md: gap-4 mt-20 sm:grid-cols-1"
      >
        <div className="card md:w-96 bg-base-100 shadow-xl">
          <figure className=" rounded-full ">
            <img src="https://i.ibb.co.com/hKR931Y/jeff-bezos-looking-to-side-tk92mca2uf3jb985.webp" />
          </figure>
          <div className="card-body">
            <h1 className="text-center text-xl font-bold">Jeff Bezos</h1>
            <div className="flex justify-center items-center">
              <IoStarSharp />
              <IoStarSharp />
              <IoStarSharp />
              <IoStarSharp />
              <IoStarSharp />
            </div>
            <div>
              <p>
                I am Jeff Bezos <br />I recently bought a dining set from Furni
                Flex, and I could not be happier! The quality of the wood is
                excellent, and the chairs are both stylish and comfortable. The
                website was easy to navigate, and the delivery was prompt. I
                will definitely shop here again!
              </p>
            </div>
          </div>
        </div>
        <div className="card w-96 bg-base-100 shadow-xl">
          <figure className=" rounded-full ">
            <img src="https://i.ibb.co.com/tLvZnvB/elon-musk-powerwall-launch-2015-lq37qohabwht51a4.webp" />
          </figure>
          <div className="card-body">
            <h1 className="text-center text-xl font-bold">Elon Mask</h1>
            <div className="flex justify-center items-center">
              <IoStarSharp />
              <IoStarSharp />
              <IoStarSharp />
              <IoStarSharp />
              <IoStarSharp />
            </div>
            <div>
              <p>
                I am Elon Mask <br />
                AI ordered a couple of office chairs for my home office, and
                they are perfect! The ergonomic design has really improved my
                posture. Great customer service too, they answered all my
                questions quickly. Highly recommend Digital Health Care for anyone
                looking for quality furniture!
              </p>
            </div>
          </div>
        </div>
        <div className="card w-96 bg-base-100 shadow-xl">
          <figure className=" rounded-full ">
            <img src="https://i.ibb.co.com/KKHgYXp/seminar-bill-gates-8t4rvhjfhlchcwsh.webp" />
          </figure>
          <div className="card-body">
            <h1 className="text-center text-xl font-bold">Bill Gates</h1>
            <div className="flex justify-center items-center">
              <IoStarSharp />
              <IoStarSharp />
              <IoStarSharp />
              <IoStarSharp />
              <IoStarSharp />
            </div>
            <div>
              <p>
                I am Bill Gates <br />I purchased a lounge chair from Furni
                Flex, and it’s fantastic! It was easy to assemble, and the
                design fits perfectly in my living room. The price was also very
                reasonable for the quality. I wll be coming back for more
                furniture in the future.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20 font-sans">
        
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Review;
