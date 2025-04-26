import { clients } from "@/constants";
import styles from "@/style";
import Image from "next/image";

const Clients = () => (
  <section
    className={`${styles.flexCenter} container mx-auto mt-12 pb-5 md:pb-12`}
  >
    <div
      className={`${
        styles.flexCenter
      } ${"flex-col md:flex-row"} space-x-2 md:space-y-0 space-y-10 md:flex-nowrap flex-wrap w-full md:flex hidden`}
    >
      {clients.map((client) => (
        <div
          key={client.id}
          className={`flex-1 ${styles.flexCenter} sm:min-w-[192px] cursor-pointer min-w-[140px]`}
        >
          <Image
            src={client.logo}
            alt="client"
            className="md:w-[230px] w-[150px] object-contain"
            style={{
              transition: "transform 0.3s ease",
              transform: "scale(1)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      ))}
    </div>
    <div className="scroller md:hidden flex">
        <div className="scroller-inner">
          {clients.map((client) => (
            <div key={client.id} className="scroller-item">
              <Image
                src={client.logo}
                alt="client"
                className="md:w-[230px] w-[150px] object-contain"
                style={{
                  transition: "transform 0.3s ease",
                  transform: "scale(1)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          ))}
        </div>
      </div>
  </section>
  
);

export default Clients;
