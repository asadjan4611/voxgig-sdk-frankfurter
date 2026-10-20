
import { cmp, Content } from '@voxgig/sdkgen'


const ReadmeTopHowto = cmp(function ReadmeTopHowto(props: any) {
  const { target } = props

  Content(`**TypeScript:**
\`\`\`ts
const result = await client.direct({
  path: '/currencies',
  method: 'GET',
})
if (result.ok) {
  console.log(result.data)
}
\`\`\`

`)

})


export {
  ReadmeTopHowto
}
