import type { FC } from 'react'

export type PageProps = {}

const Page: FC<PageProps> = async () => {
  // const data = await queryNotionDatabase()

  return (
    <div>
      <div className="container">
        <div className="text-2xl">Genshin Impact Characters</div>
      </div>
    </div>
  )
}

export default Page
