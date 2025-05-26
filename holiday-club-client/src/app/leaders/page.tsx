import Link from 'next/link'
import Layout from "@/components/layout";

export default function Page() {
  return (
    <>
    <Layout>
          <h1>Leaders Page</h1>
      <section>
        <h2>Below is your timetable for the week</h2>
        <p>Timetable</p>
      </section>
      <Link href="/">Home</Link>
    </Layout>
  
    </>
  );
}

