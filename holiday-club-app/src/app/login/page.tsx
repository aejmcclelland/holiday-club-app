import Link from 'next/link'
import Layout from "@/components/layout"; 
import React from 'react';

const Login: React.FC = () => {
  return (
      <Layout>
        <h1>Holiday Bible Club</h1>
        <section>
          <h2>Create an account to register</h2>
          <p>Register your child/children for Holiday Bible Club. It is a fun-filled week of games, crafts, Bible stories, and songs.</p>
        </section>
        <Link href="/">Home</Link>
      </Layout>
  
  )
}

export default Login;