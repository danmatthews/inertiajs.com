import React from 'react'
import dedent from 'dedent-js'
import { A, Code, CodeBlock, H1, H2, H3, Layout, P } from '@/Components'

const meta = {
  title: 'Progress indicators',
  links: [
    { url: '#default', name: 'Default' },
    { url: '#custom', name: 'Custom' },
  ],
}

const Page = () => {
  return (
    <>
      <H1>Progress indicators</H1>
      <P>
        Since Inertia requests are made via XHR, there's no default browser loading indicator when navigating from one
        page to another. To solve this, Inertia provides an optional{' '}
        <A href="https://github.com/inertiajs/progress">progress</A> library, which shows a loading bar whenever you
        make an Inertia visit. It's also possible to setup your own custom page loading indicators. This page explains
        both approaches.
      </P>
      <H2>Default</H2>
      <P>
        Inertia's default progress library (<Code>@inertiajs/progress</Code>) is a light wrapper around{' '}
        <A href="https://ricostacruz.com/nprogress/">NProgress</A>. This library shows, updates, and hides the NProgress
        loading bar by listening to Inertia page visit <A href="/events">events</A>.
      </P>
      <P>To use it, start by installing it:</P>
      <CodeBlock
        language="bash"
        children={dedent`
          npm install @inertiajs/progress
          yarn add @inertiajs/progress
        `}
      />
      <P>Once it's been installed, initialize it in your app.</P>
      <CodeBlock
        language="js"
        children={dedent`
          import { InertiaProgress } from '@inertiajs/progress'\n
          InertiaProgress.init()
        `}
      />
      <P>
        It also provides a number of customization options, which you pass to the <Code>init()</Code> method.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          InertiaProgress.init({
            // The delay after which the progress bar will
            // appear during navigation, in milliseconds.
            delay: 250,\n
            // The color of the progress bar.
            color: '#29d',\n
            // Whether to include the default NProgress styles.
            includeCSS: true,\n
            // Whether the NProgress spinner will be shown.
            showSpinner: false,
          })
        `}
      />
      <H2>Custom</H2>
      <P>It's also possible to setup your own custom page loading indicators by hooking into Inertia's <A href="/events">events</A> system. 
         Note that in order for your loader to persist correctly between page visits, you'll need to implement your loader's HTML outside of Inertia's main component.
         A good example of this can be seen in our own official progress plugin {' '}
         <A href="https://github.com/inertiajs/progress/blob/master/src/progress.js">here</A>.
      <P>
        Here's a basic step-through of how to hook into Inertia's progress events, using the <A href="https://ricostacruz.com/nprogress/">NProgress</A> library as an
        example.
      </P>
      <P>First, install the NProgress library.</P>
      <CodeBlock
        language="bash"
        children={dedent`
          npm install nprogress
          yarn add nprogress
        `}
      />
      <P>
        You'll need to add the NProgress{' '}
        <A href="https://github.com/rstacruz/nprogress/blob/master/nprogress.css">styles</A> to your project. You can do
        this using the CDN version.
      </P>
      <CodeBlock
        language="html"
        children={dedent`
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css" />
        `}
      />
      <P>
        Next, import both <Code>NProgress</Code> and <Code>Inertia</Code> into your application.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          import NProgress from 'nprogress'
          import { Inertia } from '@inertiajs/inertia'
        `}
      />
      <P>
        Next, let's add a <Code>start</Code> event listener. We'll use this listener to show the progress bar when a new
        Inertia visit begins.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          Inertia.on('start', () => NProgress.start())
        `}
      />
      <P>
        Next, let's add a <Code>finish</Code> event listener to hide the progress bar when the page visit finishes.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          Inertia.on('finish', () => NProgress.done())
        `}
      />
      <P>
        That's it, you now have a working page loading indicator! As you navigate from one page to another, the progress
        bar will be added and removed from the page.
      </P>
      <H3>Handling cancelled visits</H3>
      <P>
        While this implementation works great for visits that finish properly, it would be nice to handle cancelled
        visits a little better. First, for interrupted visits (those that get cancelled as a result of a new visit) the
        progress bar should simply be reset back to the start position. Second, for manually cancelled visits, the
        progress bar should be immediately removed from the page.
      </P>
      <P>
        We can do this by inspecting the <Code>event.detail.visit</Code> object that's provided to the finish event.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          Inertia.on('finish', (event) => {
            if (event.detail.visit.completed) {
              NProgress.done()
            } else if (event.detail.visit.interrupted) {
              NProgress.set(0)
            } else if (event.detail.visit.cancelled) {
              NProgress.done()
              NProgress.remove()
            }
          })
        `}
      />
      <P>Much better!</P>
      <H3>File upload progress</H3>
      <P>
        Let's take this a step further yet. When files are being uploaded, it would be great to update the loading
        indicator to reflect the upload progress. This can be done using the <Code>progress</Code> event.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          Inertia.on('progress', (event) => {
            if (event.detail.progress.percentage) {
              NProgress.set((event.detail.progress.percentage / 100) * 0.9)
            }
          })
        `}
      />
      <P>
        Now, instead of the progress bar "trickling" while the files are being uploaded, it will actually update it's
        position based on the progress of the request. We limit the progress here to 90%, since we still need to wait
        for a response from the server.
      </P>
      <H3>Loading indicator delay</H3>
      <P>
        The last thing we're going to implement is a loading indicator delay. It's often preferable to delay showing the
        loading indicator until a request has taken longer than <Code>250ms</Code>-<Code>500ms</Code>. This prevents the
        loading indicator from appearing constantly on quick page visits, which can be visually distracting.
      </P>
      <P>
        To implement the delay behaviour, we'll use the <Code>setTimeout</Code> and <Code>clearTimeout</Code> functions.
        Let's start by defining a variable to keep track of the timeout.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          let timeout = null
        `}
      />
      <P>
        Next, let's update the <Code>start</Code> event listener to start a new timeout that will show the progress bar
        after <Code>250ms</Code>.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          Inertia.on('start', () => {
            timeout = setTimeout(() => NProgress.start(), 250)
          })
        `}
      />
      <P>
        Next, we'll update the <Code>finish</Code> event listener to clear any existing timeouts, in the event that the
        page visit finishes before the timeout does.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          Inertia.on('finish', (event) => {
            clearTimeout(timeout)
            // ...
          })
        `}
      />
      <P>
        We also need to check in the <Code>finish</Code> event listener if the progress bar has actually started,
        otherwise we'll inadvertently cause it to show before the timeout has finished.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          Inertia.on('finish', (event) => {
            clearTimeout(timeout)
            if (!NProgress.isStarted()) {
              return
            }
            // ...
          })
        `}
      />
      <P>
        And finally, we need to do the same check in the <Code>progress</Code> event listener.
      </P>
      <CodeBlock
        language="js"
        children={dedent`
          Inertia.on('progress', event => {
            if (!NProgress.isStarted()) {
              return
            }
            // ...
          }
        `}
      />
      <P>That's it, you now have a beautiful custom page loading indicator!</P>
      <H3>Complete example</H3>
      <P>For your quick reference, here is the full source code of the final version.</P>
      <CodeBlock
        language="js"
        children={dedent`
          import NProgress from 'nprogress'
          import { Inertia } from '@inertiajs/inertia'\n
          let timeout = null\n
          Inertia.on('start', () => {
            timeout = setTimeout(() => NProgress.start(), 250)
          })\n
          Inertia.on('progress', (event) => {
            if (NProgress.isStarted() && event.detail.progress.percentage) {
              NProgress.set((event.detail.progress.percentage / 100) * 0.9)
            }
          })\n
          Inertia.on('finish', (event) => {
            clearTimeout(timeout)
            if (!NProgress.isStarted()) {
              return
            } else if (event.detail.visit.completed) {
              NProgress.done()
            } else if (event.detail.visit.interrupted) {
              NProgress.set(0)
            } else if (event.detail.visit.cancelled) {
              NProgress.done()
              NProgress.remove()
            }
          })
        `}
      />
    </>
  )
}

Page.layout = page => <Layout children={page} meta={meta} />

export default Page
