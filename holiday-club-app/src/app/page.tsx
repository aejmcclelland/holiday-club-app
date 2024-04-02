import Link from 'next/link'
import Layout from "@/components/layout";

export default function Page() {
  return (
    <>
    <Layout>
          <h1>Holiday Bible Club</h1>
      <section>
        <h2>What is Holiday Bible Club?</h2>
        <p>Holiday Bible Club is a week-long event for children aged 5-11. It is a fun-filled week of games, crafts, Bible stories, and songs.</p>
      </section>
      <Link href="/login">Login Page</Link>
    </Layout>
  
    </>
  );
}

