'use client'

import { http } from '@nextastic/http'
import { useState } from 'react'

interface GreetingFormProps {}

export default function GreetingForm(props: GreetingFormProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState('')

  const submit = () => {
    http
      .post<{ message: string }>('/api/greeting', {
        name,
      })
      .then((response) => setResult(response.message))
      .catch((error) => setError(error.message))
  }
  return (
    <div className="flex flex-col gap-4 w-[200px] mt-6">
      <input
        type="text"
        className="border"
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <button type="button" onClick={submit} className="border">
        Submit
      </button>
    </div>
  )
}
