import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Navigation.module.css'

import {logout} from '../../../http/index'
import {useDispatch,useSelector} from 'react-redux'
import {setAuth} from '../../../store/authSlice'


const Navigation = () => {
    const dispatch=useDispatch()
    const {isauth,user}=useSelector(state=>state.auth)

    //Inline css
    const brandStyle={
        color:'#fff',
        textDecoration:'none',
        fontWeight:'bold',
        fontSize:'22px',
        display:'flex',
        alignItems:'center'
    }

    const logoText={
        marginLeft:'10px'
    }

    const logoutUser=async ()=>{
        try{
            const {data}=await logout()
            dispatch(setAuth(data))
        }catch(err){
            console.log(err)
        }
    }

  return (
    <nav className={`${styles.navbar} container`}>
        <Link to="/" style={brandStyle}>
            <img src="/images/logo.png" alt="logo" />
            <span style={logoText}>
                Codershouse
            </span>
        </Link>
        {isauth && 
            (<div className={styles.navright}>
            {(user && user.name)?(<h3 className={styles.userName}>{user.name}</h3>):<></>}
            <Link to='/'>
                <img className={styles.avatar} src={user.avatar?user.avatar : '/images/monkey-avatar.png'} width='30' height='30' alt="avatar" />
            </Link>
            {isauth && <button  className={styles.logoutButton} onClick={logoutUser}>Logout</button>}
        </div>)
        }
        
        
    </nav>
  )
}

export default Navigation