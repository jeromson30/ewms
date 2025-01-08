"use client"
import styles from "../page.module.css";
import Header from "../components/header"
import React, { useState, FormEvent  } from 'react';


export function Signin() {
  async function onSubmit(formData: FormData) {
    //console.log(formData.get('login'))
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
          "Content-Type": "multipart/form-data",
      },
      body: JSON.stringify({login: formData.get('login'), password: formData.get('password')}),
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error('Failed to submit the data. Please try again.')
    } else {
      console.log(data.data)
    }

    // Handle response if necessary
    
    
  }
  
  return (
    <div className={styles.page + ' login_page'}>
      {/* <Header/> */}
      <main className={'login ' + styles.main}> 
        <form action={onSubmit}>
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