"use client"
import styles from "../page.module.css";
import Header from "../components/header"
import React, { useState, FormEvent  } from 'react';
import { signIn } from '@/app/actions/signin'


export function Signin() {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget);

    const response = await fetch('/api/login', {
      method: 'POST',
      body: formData,
    })

    const responseData = await response;
    // Handle response if necessary
    //const data = await response
    console.log(responseData)
    // ...
  }
  
  return (
    <div className={styles.page + ' login_page'}>
      {/* <Header/> */}
      <main className={'login ' + styles.main}> 
        <form onSubmit={onSubmit}>
          <p className="login_title">Authentification</p>
            <label htmlFor={'login'}>Identifiant </label>
            <input type="text" id="login" name="login"></input>
            <br />
            <label htmlFor={'password'}>Mot de  passe </label>
            <input type="password" id="password" name="password"></input>
            <br />
            <button type="submit" className="btn_loginsubmit">Se connecter</button>
        </form>
      </main>
    </div>
  );
};

export default Signin;