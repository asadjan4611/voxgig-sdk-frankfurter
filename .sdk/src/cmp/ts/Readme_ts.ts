import { Content, File, cmp, ReadmeIntro, ReadmeInstall, ReadmeQuick,
  ReadmeHowto, ReadmeModel, ReadmeOptions, ReadmeEntity,
  ReadmeExplanation, ReadmeRef } from '@voxgig/sdkgen'
import { ReadmeStation } from '@voxgig/sdkgen/dist/cmp/ReadmeStation'
import { ReadmeFeatures } from '@voxgig/sdkgen/dist/cmp/ReadmeFeatures'
import { ReadmeUnions } from '@voxgig/sdkgen/dist/cmp/ReadmeUnions'

import { ReadmeErrors } from './ReadmeErrors_ts'


const Readme = cmp(function Readme(props: any) {
  const { target } = props

  File({ name: 'README.md' }, () => {
    ReadmeIntro({ target })
    ReadmeInstall({ target })
    ReadmeQuick({ target })
    ReadmeStation({ target })
    ReadmeErrors({ target })
    ReadmeHowto({ target })
    ReadmeModel({ target })
    ReadmeOptions({ target })
    ReadmeEntity({ target })
    ReadmeFeatures({ target })
    ReadmeUnions({ target })
    ReadmeExplanation({ target })

    Content(`
## Full Reference

See [REFERENCE.md](REFERENCE.md) for complete API reference
documentation including all method signatures, entity field schemas,
and detailed usage examples.
`)
  })

  ReadmeRef({ target })
})


export { Readme }
