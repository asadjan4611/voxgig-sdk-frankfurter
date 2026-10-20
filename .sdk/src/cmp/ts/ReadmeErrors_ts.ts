import { Content, cmp, pickExampleEntity, primaryOpCall,
  entityIdField, exampleVarName } from '@voxgig/sdkgen'
import { KIT, getModelPath } from '@voxgig/apidef'


const ReadmeErrors = cmp(function ReadmeErrors(props: any) {
  const { target, ctx$: { model } } = props
  const entities = getModelPath(model, `main.${KIT}.entity`, {
    only_active: false,
    required: false,
  }) || {}
  const { entity, primaryOp } = pickExampleEntity(entities)

  Content(`
## Error handling

`)

  if (entity && primaryOp) {
    const eName = entity.Name ||
      (entity.name[0].toUpperCase() + entity.name.slice(1))
    const eVar = exampleVarName(eName.toLowerCase(), target.name)
    const baseCall = primaryOpCall('ts', eName, eVar, primaryOp,
      entityIdField(entity), entity)
    const call = 'list' === primaryOp
      ? { ...baseCall, resultVar: eVar + 'List' }
      : baseCall

    Content(`Entity operations reject on failure, so wrap them in \`try\` / \`catch\`:

\`\`\`ts
try {
  const ${call.resultVar} = await ${call.expr}
  console.log(${'list' === primaryOp
    ? call.resultVar + '.map((item) => item.data())'
    : call.resultVar + '.data()'})
} catch (err) {
  console.error('${primaryOp} failed:', err)
}
\`\`\`

`)
  }

  Content(`The low-level \`direct()\` method does **not** throw — it returns the
result envelope. Branch on \`ok\`; on failure \`status\` holds the HTTP status
and \`err\` holds a transport error:

\`\`\`ts
const result = await client.direct({
  path: '/currency/{code}',
  method: 'GET',
  params: { code: 'NOT_A_CURRENCY' },
})

if (!result.ok) {
  console.error('request failed:', result.status, result.err)
}
\`\`\`

`)
})


export { ReadmeErrors }
