import Head from "next/head";
import styles from "../styles/Home.module.css";

function findtheDate(dateString = "06 November", year = 2023) {
  const date = new Date(`${dateString} ${year}`);
  return date;
}

// todo how to sort by date?
function dateSorter(a, b) {
  return a - b;
}

function whichFlatIsNext(knownLastDuty, nextCollection) {
  const flats = ["A", "B", "C"];

  const lastDutyIndex = flats.indexOf(knownLastDuty.flat);
  const knownLastDutyDate = new Date(knownLastDuty.date);

  // difference between next collection date and last known date
  const diff = nextCollection - knownLastDutyDate;
  // how many weeks is that?
  const weeks = diff / (1000 * 60 * 60 * 24 * 7);
  const nextDutyIndex = (lastDutyIndex + weeks) % flats.length;
  return flats[nextDutyIndex];
}

export default function Home(props) {
  const knownLastDuty = { flat: "C", date: "2024-01-29" };
  const today = new Date();

  const nextCollection = props.Refuse_collection_dates.map(
    (item) => item.Next_Collection
  )
    .map((d) => findtheDate(d, today.getFullYear()))
    .sort(dateSorter)[0]; // bit hacky

  return (
    <div className={styles.container}>
      <Head>
        <title>Bin Days!</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        className={styles.main}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <h1 className={styles.title}>Bin collection days</h1>
        <h2>For 36 Muswell Avenue</h2>

        <section>Today is {new Date().toDateString()}</section>
        <section>
          Flat {knownLastDuty.flat} has done the bins on {knownLastDuty.date}{" "}
        </section>
        <section>
          Therefore the next duty is for Flat{" "}
          {whichFlatIsNext(knownLastDuty, nextCollection)} on{" "}
          {nextCollection.toDateString()}
        </section>

        <ul>
          {props.Refuse_collection_dates.map((item) => {
            const topic = item._.replace(/<[^>]*>?/gm, "");
            return (
              <li key={topic}>
                <section>
                  <h3>{topic}</h3>
                  <div>Last Collection: {item.Last_Collection}</div>
                  <div>Next Collection: {item.Next_Collection}</div>
                </section>
              </li>
            );
          })}
        </ul>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://erkinunlu.net"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by your friendly neighbour Erkin ❤️
        </a>
      </footer>
    </div>
  );
}

export async function getServerSideProps() {
  const res = await fetch(
    "https://my.haringey.gov.uk/getdata.aspx?RequestType=LocalInfo&ms=mapsources/MyHouse&format=JSON&group=Property%20details|Refuse%20collection%20dates&uid=100021204359"
  );

  const data = await res.json();
  return {
    props: data.Results ?? {},
  };
}
