
import Image from 'next/image'

export default function Loading() {
  return (
    <div  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Image
        src="/loading2.svg"
        alt="Loading animation"
        width={100}
        height={100}
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  )
}

