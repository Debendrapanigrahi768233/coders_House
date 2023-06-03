import React, { useState } from 'react'
import Card from '../../../components/shared/Card/Card'
import TextInput from '../../../components/shared/TextInput/TextInput'
import Button from '../../../components/shared/Button/Button'
import styles from './StepOtp.module.css'

import { verifyOtp } from '../../../http'
import { useSelector } from 'react-redux'
import { setAuth } from '../../../store/authSlice'
import { useDispatch } from 'react-redux'

const StepOtp = ({onNext}) => {
  const [otp,SetOtp]=useState('')
  const {phone,hash}=useSelector((state)=>state.auth.otp)
  const dispatch=useDispatch()

  const submit=async ()=>{
    if(!otp || !phone || !hash){
        return;
    }
    try{
        const {data}=await verifyOtp({otp,phone,hash})
        dispatch(setAuth(data))
        console.log(data)
    }catch(err){
        console.log(err)
    }
  }
  return (
    <>
    <div className={styles.cardWrapper}>
        <Card title='Welcome to Otp !' logo='lock'>
            <TextInput value={otp} onChange={(e)=>SetOtp(e.target.value)}></TextInput>
            <div>
                <div className={styles.actionButton}>
                    <Button text='Next' icon='arrow' onClick={submit}></Button>
                </div>
            </div>
            <p className={styles.paragraph}>
                Bu signing in you agree to our terms and conditions.
            </p>
        </Card>
    </div>
    </>
  )
}

export default StepOtp