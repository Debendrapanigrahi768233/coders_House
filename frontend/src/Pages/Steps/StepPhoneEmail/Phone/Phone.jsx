import React, { useState } from 'react'
import Card from '../../../../components/shared/Card/Card'
import Button from '../../../../components/shared/Button/Button'
import TextInput from '../../../../components/shared/TextInput/TextInput'
import styles from '.././StepPhoneEmail.module.css'

import {sendOtp} from '../../../../http/index'
import {useDispatch} from 'react-redux'
import { setOtp } from '../../../../store/authSlice'

const Phone = ({onNext}) => {
    const [phoneNumber,setPhoneNumber]=useState('')
    const dispatch=useDispatch()

    async function submit(){
        //Server Request
        
        const {data}=await sendOtp({phone:phoneNumber})
        dispatch(setOtp({phone:data.phone,hash:data.hash}))
        console.log(data)

        onNext()
    }

  return (
    <>
        <Card title='Welcome to phone !' logo='phone'>
            <TextInput value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)}></TextInput>
            <div>
                <div className={styles.actionButton}>
                    <Button text='Next' icon='arrow' onClick={submit}></Button>
                </div>
            </div>
            <p className={styles.paragraph}>
                Bu signing in you agree to our terms and conditions.
            </p>
        </Card>
    </>

  )
}

export default Phone