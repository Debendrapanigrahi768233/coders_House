import React from 'react'
import styles from './Home.module.css'
import { Link,useNavigate } from 'react-router-dom'
import Card from '../../components/shared/Card/Card'
import Button from '../../components/shared/Button/Button'

const Home = () => {
  const reactNavigator=useNavigate()
  const startRegister=()=>{
    // console.log('hello')
    reactNavigator('/authenticate')
  }
  return (
    <div className={styles.classWrapper}>
        <Card title='Welcome to Codershouse!' logo='logo'>
            <p className={styles.text}>A place where collaborators can talk with each other in real time and execute projects together</p>
            <Button text='Lets Go' icon='arrow' onClick={startRegister}></Button>
            <div style={{marginTop:'5px'}}>
                <span style={{fontWeight: '300'}}>Already have an accont? </span>
                {/* <Link style={{textDecoration:'none',marginLeft:'5px'}} to='/login'>
                    <span>Login</span>
                </Link> */}
            </div>
        </Card>
    </div>
  )
}

export default Home