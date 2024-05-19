import GreetingForm from '@/app/GreetingForm'
import Image from 'next/image'

export default function Home() {
  return (
    <main>
      <div className="flex justify-center py-6">
        <div>
          <h1 className="text-center mb-4">What is your name?</h1>
          <GreetingForm />
        </div>
      </div>
    </main>
  )
}
