import React, { useState } from 'react'
import Card from '../../../../components/shared/Card/Card'
import Button from '../../../../components/shared/Button/Button'
import styles from '.././StepPhoneEmail.module.css'
import TextInput from '../../../../components/shared/TextInput/TextInput'


const Email = ({onNext}) => {
    const [email,setEmail]=useState('')
  return (
    <>
        <Card title='Welcome to Email' logo='email-emoji'>
            <TextInput value={email} onChange={(e)=>setEmail(e.target.value)}></TextInput>
            <div>
                <div className={styles.actionButton}>
                    <Button text='Lets Go' icon='arrow' onClick={onNext}></Button>
                </div>
            </div>
            <p className={styles.paragraph}>
                Bu signing in you agree to our terms and conditions.
            </p>
        </Card>
    </>

  )
}

export default Email