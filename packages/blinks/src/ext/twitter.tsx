import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { useOnClickOutside } from 'usehooks-ts'
import {
  Action,
  type ActionAdapter,
  type ActionCallbacksConfig,
  ActionsRegistry,
  type ActionSupportStrategy,
  defaultActionSupportStrategy,
  getExtendedActionState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
} from '../api'
import { checkSecurity, type SecurityLevel } from '../shared'
import { ActionContainer, type StylePreset } from '../ui'
import { noop } from '../utils/constants'
import { isInterstitial } from '../utils/interstitial-url.ts'
import { proxify } from '../utils/proxify.ts'
import { type ActionsJsonConfig, ActionsURLMapper } from '../utils/url-mapper'

// const RPC_URL = 'https://api.mainnet-beta.solana.com'
// const connection = new Connection(RPC_URL)

type ObserverSecurityLevel = SecurityLevel

export interface ObserverOptions {
  // trusted > unknown > malicious
  securityLevel:
    | ObserverSecurityLevel
    | Record<'websites' | 'interstitials' | 'actions', ObserverSecurityLevel>
  supportStrategy: ActionSupportStrategy
}

interface NormalizedObserverOptions {
  securityLevel: Record<
    'websites' | 'interstitials' | 'actions',
    ObserverSecurityLevel
  >
  supportStrategy: ActionSupportStrategy
}

const DEFAULT_OPTIONS: ObserverOptions = {
  securityLevel: 'only-trusted',
  supportStrategy: defaultActionSupportStrategy,
}

const normalizeOptions = (
  options: Partial<ObserverOptions>,
): NormalizedObserverOptions => {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    securityLevel: (() => {
      if (!options.securityLevel) {
        return {
          websites: DEFAULT_OPTIONS.securityLevel as ObserverSecurityLevel,
          interstitials: DEFAULT_OPTIONS.securityLevel as ObserverSecurityLevel,
          actions: DEFAULT_OPTIONS.securityLevel as ObserverSecurityLevel,
        }
      }

      if (typeof options.securityLevel === 'string') {
        return {
          websites: options.securityLevel,
          interstitials: options.securityLevel,
          actions: options.securityLevel,
        }
      }

      return options.securityLevel
    })(),
  }
}

export function setupTwitterObserver(
  config: ActionAdapter,
  callbacks: Partial<ActionCallbacksConfig> = {},
  options: Partial<ObserverOptions> = DEFAULT_OPTIONS,
) {
  const mergedOptions = normalizeOptions(options)
  const twitterReactRoot = document.getElementById('react-root')!

  const refreshRegistry = async () => {
    return ActionsRegistry.getInstance().init()
  }

  // if we don't have the registry, then we don't show anything
  refreshRegistry().then(() => {
    // entrypoint
    const observer = new MutationObserver((mutations) => {
      // it's fast to iterate like this
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i]

        for (let j = 0; j < mutation.addedNodes.length; j++) {
          const node = mutation.addedNodes[j]
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return
          }
          handleNewNode(
            node as Element,
            config,
            callbacks,
            mergedOptions,
          ).catch(noop)
        }
      }
    })

    observer.observe(twitterReactRoot, { childList: true, subtree: true })
  })
}

const ReactSpan = ({ domain }: { domain: string }) => {
  const [showPopup, setShowPopup] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [owner, setOwner] = useState<string | null>(null)

  const handleClickOutside = () => {
    setShowPopup(false)
  }

  useOnClickOutside(popupRef, handleClickOutside)

  useEffect(() => {
    if (popupRef.current) {
      const reactSpan = document.getElementById('react-span')
      if (reactSpan) {
        const rect = reactSpan.getBoundingClientRect()
        popupRef.current.style.top = `${rect.top + 32}px`
        popupRef.current.style.left = `${rect.left}px`
        popupRef.current.style.zIndex = '1000'
      }

      resolveDomain(domain).then((owner) => {
        console.log(owner)
      })
    }
  }, [showPopup])

  function trimWalletAddress(walletAddress: string) {
    return walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
  }

  async function resolveDomain(domain: string) {
    try {
      setIsLoading(true)
      const response = await fetch(
        `https://www.dotblink.me/api/username/${domain.split('.')[0]}/profile`,
      )
      const data = await response.json()
      setOwner(data.owner.address)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <span className="inline" onClick={(e) => e.stopPropagation()}>
        <span
          id="react-span"
          style={{ color: 'orange', cursor: 'pointer' }}
          onClick={() => setShowPopup(!showPopup)}
        >
          {domain}
        </span>
      </span>
      {createPortal(
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 320,
            height: 'auto',
            backgroundColor: 'rgba(0,0,0,0.9)',
            borderRadius: 18,
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(86,86,86,0.5)',
            zIndex: 1000,
            display: showPopup ? 'block' : 'none',
            overflow: 'hidden',
            fontFamily: 'TwitterChirp',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '300px',
              overflow: 'hidden',
              position: 'absolute',
              pointerEvents: 'none',
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          >
            <svg
              style={{
                position: 'absolute',
                top: 20,
                right: 0,
                zIndex: 1,
              }}
              width="202"
              height="184"
              viewBox="0 0 202 184"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_f_113_1479)">
                <ellipse
                  cx="118.464"
                  cy="95.6686"
                  rx="40.4645"
                  ry="44.6686"
                  fill="url(#paint0_linear_113_1479)"
                  fill-opacity="0.6"
                />
              </g>
              <defs>
                <filter
                  id="filter0_f_113_1479"
                  x="0.0139618"
                  y="-26.986"
                  width="236.902"
                  height="245.309"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="38.993"
                    result="effect1_foregroundBlur_113_1479"
                  />
                </filter>
                <linearGradient
                  id="paint0_linear_113_1479"
                  x1="118.464"
                  y1="51"
                  x2="118.464"
                  y2="140.337"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#4369E7" />
                  <stop offset="1" stop-color="#7E22CE" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <figure
              style={{
                position: 'relative',
                width: '100%',
                height: '90px',
                padding: 0,
                margin: 0,
              }}
            >
              <img
                src="https://img.freepik.com/free-vector/gradient-grainy-gradient-background_23-2149881119.jpg"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              <img
                src="https://img.freepik.com/free-vector/gradient-grainy-gradient-background_23-2149881119.jpg"
                style={{
                  position: 'absolute',
                  bottom: -10,
                  zIndex: 1000,
                  left: '25%',
                  width: '80%',
                  height: '50%',
                  filter: 'blur(33px)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  height: 16,
                  borderRadius: 20,
                  display: 'flex',
                  padding: 4,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                }}
              >
                <svg
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    zIndex: 1000,
                    position: 'relative',
                  }}
                  width="135"
                  height="135"
                  viewBox="0 0 135 135"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_129_1552)">
                    <path
                      d="M67.5 135C104.779 135 135 104.779 135 67.5C135 30.2208 104.779 0 67.5 0C30.2208 0 0 30.2208 0 67.5C0 104.779 30.2208 135 67.5 135Z"
                      fill="url(#paint0_linear_129_1552)"
                    />
                    <path
                      d="M61.7346 123.971C59.8438 123.779 57.9637 123.492 56.1016 123.111C54.2736 122.737 52.4446 122.267 50.6646 121.711C48.9046 121.164 47.1516 120.522 45.4526 119.803C43.7696 119.091 42.1016 118.288 40.4936 117.414C38.8856 116.54 37.3236 115.591 35.8166 114.572C34.3096 113.553 32.8466 112.46 31.4496 111.306C30.0526 110.152 28.6996 108.923 27.4206 107.645C26.1416 106.367 24.9096 105.011 23.7596 103.616C22.6096 102.221 21.5056 100.753 20.4936 99.2531C19.4816 97.7531 18.5196 96.1721 17.6516 94.5761C16.7836 92.9801 15.9756 91.2991 15.2636 89.6161C14.5456 87.9181 13.9056 86.1641 13.3556 84.4061C12.8016 82.6261 12.3316 80.7971 11.9556 78.9691C11.575 77.107 11.288 75.227 11.0956 73.3361C10.7051 69.4793 10.7051 65.593 11.0956 61.7361C11.288 59.8453 11.575 57.9653 11.9556 56.1031C12.3296 54.2751 12.7996 52.4461 13.3556 50.6661C13.9056 48.9061 14.5456 47.1521 15.2636 45.4531C15.9756 43.7701 16.7796 42.1021 17.6526 40.4941C18.5256 38.8861 19.4756 37.3241 20.4946 35.8171C21.5136 34.3101 22.6066 32.8481 23.7606 31.4501C24.9146 30.0521 26.1436 28.7001 27.4216 27.4211C28.6996 26.1421 30.0556 24.9101 31.4506 23.7601C32.8456 22.6101 34.3176 21.5081 35.8176 20.4941C37.3176 19.4801 38.8986 18.5201 40.4946 17.6521C42.0906 16.7841 43.7706 15.9751 45.4536 15.2631C47.1536 14.5451 48.9056 13.9031 50.6656 13.3551C52.4456 12.8011 54.2746 12.3311 56.1026 11.9551C57.9647 11.5745 59.8448 11.2875 61.7356 11.0951C65.5924 10.7046 69.4788 10.7046 73.3356 11.0951C75.2265 11.2875 77.1065 11.5745 78.9686 11.9551C80.7966 12.3291 82.6256 12.7991 84.4056 13.3551C86.1656 13.9021 87.9186 14.5441 89.6176 15.2631C91.3006 15.9751 92.9686 16.7791 94.5766 17.6521C96.1846 18.5251 97.7466 19.4751 99.2536 20.4941C100.761 21.5131 102.223 22.6061 103.621 23.7601C105.019 24.9141 106.371 26.1431 107.65 27.4211C108.929 28.6991 110.161 30.0551 111.311 31.4501C112.461 32.8451 113.563 34.3171 114.577 35.8171C115.591 37.3171 116.551 38.8981 117.419 40.4941C118.287 42.0901 119.096 43.7701 119.808 45.4531C120.526 47.1531 121.168 48.9051 121.716 50.6651C122.27 52.4451 122.74 54.2742 123.116 56.1021C123.496 57.9643 123.783 59.8443 123.976 61.7351C124.366 65.592 124.366 69.4783 123.976 73.3351C123.783 75.226 123.496 77.106 123.116 78.9681C122.742 80.7961 122.272 82.6251 121.716 84.4051C121.169 86.1651 120.527 87.9191 119.808 89.6171C119.096 91.3001 118.293 92.9681 117.419 94.5761C116.545 96.1841 115.596 97.7461 114.577 99.2531C113.558 100.76 112.465 102.223 111.311 103.62C110.157 105.017 108.929 106.37 107.65 107.649C106.371 108.928 105.016 110.16 103.621 111.31C102.226 112.46 100.754 113.562 99.2536 114.576C97.7536 115.59 96.1726 116.55 94.5766 117.418C92.9806 118.286 91.2986 119.094 89.6156 119.806C87.9156 120.524 86.1636 121.166 84.4036 121.714C82.6236 122.268 80.7946 122.738 78.9666 123.114C77.1045 123.495 75.2245 123.782 73.3336 123.974C69.4768 124.365 65.5904 124.365 61.7336 123.974L61.7346 123.971ZM67.5346 118.121C73.1363 118.126 78.6996 117.197 83.9956 115.372C83.7813 115.082 83.623 114.755 83.5286 114.407C83.043 112.706 82.3371 111.075 81.4286 109.557H66.4106C67.7412 107.897 69.2503 106.388 70.9106 105.057H78.0616C76.3021 103.108 74.3554 101.337 72.2496 99.7681C72.0021 99.6006 71.7799 99.3986 71.5896 99.1681L72.1296 98.8081L74.9496 96.9481C75.5496 96.5281 76.1496 96.1681 76.7496 95.6881C81.4896 99.3481 87.1896 105.108 89.3496 112.788C89.3797 112.904 89.4031 113.021 89.4196 113.139C98.0144 109.017 105.269 102.549 110.348 94.4827C115.427 86.416 118.123 77.0784 118.125 67.5461C118.127 58.0137 115.436 48.6748 110.361 40.6057C105.286 32.5366 98.0344 26.0658 89.4416 21.9391C89.4287 22.124 89.3979 22.3072 89.3496 22.4861C86.3496 33.4661 76.9296 39.5862 68.7096 45.0462L65.8896 46.9061C59.4096 51.2261 50.8296 58.1262 50.8296 67.6651C50.8789 70.9534 51.8088 74.1683 53.5226 76.9751H68.0146C66.5571 78.6416 64.9281 80.1499 63.1546 81.4751H56.8176C58.5131 83.3482 60.3858 85.0528 62.4096 86.5651C62.5823 86.6899 62.743 86.8305 62.8896 86.9851C61.2096 88.0651 59.4696 89.2051 57.7296 90.5251C51.6096 85.6651 44.8296 77.9851 44.8296 67.6651C44.8296 55.2462 54.9096 47.0261 62.5296 41.9261L65.4056 40.0061C73.1456 34.9661 81.1256 29.6861 83.5256 20.9261C83.6375 20.4905 83.8498 20.087 84.1456 19.7481C73.4274 16.0273 61.7703 16.0125 51.0426 19.7061C51.2631 19.9998 51.4257 20.3327 51.5216 20.6871C52.0372 22.4646 52.7924 24.1636 53.7666 25.7371H68.4346C67.0985 27.4127 65.5677 28.9233 63.8746 30.2371H57.1836C58.8942 32.1066 60.7765 33.8114 62.8056 35.3291C63.0531 35.4967 63.2754 35.6987 63.4656 35.9291L62.9256 36.2891L60.1056 38.1491C59.5056 38.5691 58.9056 38.9291 58.3056 39.4091C53.5656 35.7491 47.8656 29.9891 45.7056 22.3091C45.6742 22.188 45.6502 22.0652 45.6336 21.9411C37.0448 26.0664 29.7958 32.5338 24.7216 40.5985C19.6474 48.6632 16.9543 57.9971 16.9525 67.5253C16.9508 77.0535 19.6403 86.3884 24.7116 94.455C29.7828 102.522 37.0293 108.992 45.6166 113.12C45.6307 112.947 45.6605 112.775 45.7056 112.607C48.7056 101.627 58.1256 95.5071 66.3456 90.0471L69.1656 88.1871C75.6456 83.8671 84.2256 76.9671 84.2256 67.4282C84.1817 64.2188 83.2955 61.0773 81.6556 58.3181H69.6686C71.1042 56.6519 72.7133 55.1434 74.4686 53.8181H78.4216C76.6778 51.8646 74.7409 50.0922 72.6406 48.5281C72.4679 48.4034 72.3072 48.2627 72.1606 48.1081C73.8406 47.0281 75.5806 45.8881 77.3206 44.5681C83.4406 49.4281 90.2206 57.1082 90.2206 67.4282C90.2206 79.8471 80.1406 88.0671 72.5206 93.1671L69.6406 95.0871C61.9006 100.127 53.9206 105.407 51.5206 114.167C51.4111 114.592 51.2059 114.987 50.9206 115.32C56.2621 117.18 61.8787 118.127 67.5346 118.121ZM61.3056 67.5801C61.3056 66.2849 61.6897 65.0187 62.4093 63.9417C63.129 62.8647 64.1518 62.0253 65.3484 61.5297C66.5451 61.034 67.8619 60.9043 69.1323 61.157C70.4027 61.4097 71.5696 62.0334 72.4855 62.9493C73.4014 63.8652 74.0251 65.0321 74.2778 66.3025C74.5305 67.5729 74.4008 68.8897 73.9051 70.0863C73.4094 71.283 72.57 72.3058 71.4931 73.0254C70.4161 73.7451 69.1499 74.1292 67.8546 74.1292C66.1177 74.1292 64.452 73.4392 63.2238 72.211C61.9956 70.9828 61.3056 69.317 61.3056 67.5801Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <linearGradient
                      id="paint0_linear_129_1552"
                      x1="16.2"
                      y1="22.275"
                      x2="119.34"
                      y2="103.545"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FFD52E" />
                      <stop offset="1" stop-color="#CB0000" />
                    </linearGradient>
                    <clipPath id="clip0_129_1552">
                      <rect width="135" height="135" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <img
                  src="https://alldomains.id/_next/image?url=%2Fimg%2Fcommunities%2Fblink.jpg&w=128&q=75"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    marginLeft: -8,
                  }}
                />
              </div>
            </figure>

            <figure
              style={{
                position: 'absolute',
                top: 50,
                left: 18,
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                padding: 0,
                margin: 0,
                overflow: 'hidden',
              }}
            >
              <img
                src="https://t3.ftcdn.net/jpg/04/56/00/16/360_F_456001627_vYt7ZFjxEQ1sshme67JAXorKRPo8gsfN.jpg"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </figure>

            <div
              style={{
                padding: '32px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: 18,
                  wordWrap: 'break-word',
                }}
              >
                {domain}
              </span>
              {isLoading ? (
                <span
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 14,
                    wordWrap: 'break-word',
                    color: 'rgba(0,0,0,0.8)',
                    borderRadius: 12,
                    height: 16,
                    width: 70,
                    backgroundColor: 'rgba(255,255,255,0.5)',
                  }}
                ></span>
              ) : owner ? (
                <span
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 14,
                    wordWrap: 'break-word',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {trimWalletAddress(owner)}
                </span>
              ) : null}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 16,
              }}
            >
              <small
                style={{
                  marginLeft: 2,
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 12,
                }}
              >
                Tip
              </small>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                }}
              >
                <button
                  style={{
                    flex: 1,
                    outline: 'none',
                    border: 'none',
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: '#1A1616',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    console.log('tip')
                  }}
                >
                  <span>
                    <strong>$SEND</strong>
                  </span>
                </button>
                <button
                  style={{
                    flex: 1,
                    outline: 'none',
                    border: 'none',
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: '#1A1616',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    justifyContent: 'center',
                  }}
                  onClick={() => {
                    console.log('tip')
                  }}
                >
                  <span>
                    <strong>$SOL</strong>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

async function handleNewNode(
  node: Element,
  config: ActionAdapter,
  callbacks: Partial<ActionCallbacksConfig>,
  options: NormalizedObserverOptions,
) {
  const element = node as Element
  // first quick filtration
  if (!element || element.localName !== 'div') {
    return
  }

  let anchor

  // SONHA: tweetText is the text of the tweet, not the link preview
  const tweetTextContainer = findTweetTextContainer(element)
  const domains = findAllDomainsInText(tweetTextContainer ?? element)

  if (domains && domains.length > 0 && tweetTextContainer) {
    console.log('tweetTextContainer', tweetTextContainer.textContent)

    const text = tweetTextContainer.textContent
    const newText = text?.replace(domains[0], '<react-span></react-span>')
    tweetTextContainer.innerHTML = newText ?? ''

    const placeholder = tweetTextContainer.querySelector('react-span')

    if (placeholder) {
      const root = createRoot(placeholder)
      root.render(<ReactSpan domain={domains[0]} />)
    }
  }

  const linkPreview = findLinkPreview(element)

  let container = findContainerInTweet(
    tweetTextContainer ?? element,
    Boolean(linkPreview),
  )

  if (linkPreview) {
    anchor = linkPreview.anchor
    container && container.remove()
    container = linkPreview.card.parentElement as HTMLElement
  } else {
    if (container) {
      return
    }
    const link = findLastLinkInText(element)
    if (link) {
      anchor = link.anchor
      container = getContainerForLink(link.tweetText)
    }
  }

  if (!anchor || !container) return

  const shortenedUrl = anchor.href
  const actionUrl = await resolveTwitterShortenedUrl(shortenedUrl)
  const interstitialData = isInterstitial(actionUrl)

  let actionApiUrl: string | null
  if (interstitialData.isInterstitial) {
    const interstitialState = getExtendedInterstitialState(actionUrl.toString())

    if (
      !checkSecurity(interstitialState, options.securityLevel.interstitials)
    ) {
      return
    }

    actionApiUrl = interstitialData.decodedActionUrl
  } else {
    const websiteState = getExtendedWebsiteState(actionUrl.toString())

    if (!checkSecurity(websiteState, options.securityLevel.websites)) {
      return
    }

    const actionsJsonUrl = actionUrl.origin + '/actions.json'
    const actionsJson = await fetch(proxify(actionsJsonUrl)).then(
      (res) => res.json() as Promise<ActionsJsonConfig>,
    )

    const actionsUrlMapper = new ActionsURLMapper(actionsJson)

    actionApiUrl = actionsUrlMapper.mapUrl(actionUrl)
  }

  const state = actionApiUrl ? getExtendedActionState(actionApiUrl) : null
  if (
    !actionApiUrl ||
    !state ||
    !checkSecurity(state, options.securityLevel.actions)
  ) {
    return
  }

  const action = await Action.fetch(
    actionApiUrl,
    config,
    options.supportStrategy,
  ).catch(noop)

  if (!action) {
    return
  }

  const { container: actionContainer, reactRoot } = createAction({
    originalUrl: actionUrl,
    action,
    callbacks,
    options,
    isInterstitial: interstitialData.isInterstitial,
  })

  addStyles(container).replaceChildren(actionContainer)

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      for (const removedNode of Array.from(mutation.removedNodes)) {
        if (
          removedNode === actionContainer ||
          !document.body.contains(actionContainer)
        ) {
          reactRoot.unmount()
          observer.disconnect()
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true })
}

function createAction({
  originalUrl,
  action,
  callbacks,
  options,
}: {
  originalUrl: URL
  action: Action
  callbacks: Partial<ActionCallbacksConfig>
  options: NormalizedObserverOptions
  isInterstitial: boolean
}) {
  const container = document.createElement('div')
  container.className = 'dialect-action-root-container'

  const actionRoot = createRoot(container)

  actionRoot.render(
    <div onClick={(e) => e.stopPropagation()}>
      <ActionContainer
        stylePreset={resolveXStylePreset()}
        action={action}
        websiteUrl={originalUrl.toString()}
        websiteText={originalUrl.hostname}
        callbacks={callbacks}
        securityLevel={options.securityLevel}
      />
    </div>,
  )

  return { container, reactRoot: actionRoot }
}

const resolveXStylePreset = (): StylePreset => {
  const colorScheme = document.querySelector('html')?.style.colorScheme

  if (colorScheme) {
    return colorScheme === 'dark' ? 'x-dark' : 'x-light'
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'x-dark' : 'x-light'
}

async function resolveTwitterShortenedUrl(shortenedUrl: string): Promise<URL> {
  const res = await fetch(shortenedUrl)
  const html = await res.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const actionUrl = doc.querySelector('title')?.textContent
  return new URL(actionUrl!)
}

function findElementByTestId(element: Element, testId: string) {
  if (element.attributes.getNamedItem('data-testid')?.value === testId) {
    return element
  }
  return element.querySelector(`[data-testid="${testId}"]`)
}

function findContainerInTweet(element: Element, searchUp?: boolean) {
  const message = searchUp
    ? (element.closest(`[data-testid="tweet"]`) ??
      element.closest(`[data-testid="messageEntry"]`))
    : (findElementByTestId(element, 'tweet') ??
      findElementByTestId(element, 'messageEntry'))

  if (message) {
    return message.querySelector('.dialect-wrapper') as HTMLElement
  }
  return null
}

function findLinkPreview(element: Element) {
  const card = findElementByTestId(element, 'card.wrapper')
  if (!card) {
    return null
  }

  const anchor = card.children[0]?.children[0] as HTMLAnchorElement

  return anchor ? { anchor, card } : null
}

function findLastLinkInText(element: Element) {
  const tweetText = findElementByTestId(element, 'tweetText')
  if (!tweetText) {
    return null
  }

  const links = tweetText.getElementsByTagName('a')
  if (links.length > 0) {
    const anchor = links[links.length - 1] as HTMLAnchorElement
    return { anchor, tweetText }
  }
  return null
}

function getContainerForLink(tweetText: Element) {
  const root = document.createElement('div')
  root.className = 'dialect-wrapper'
  const dm = tweetText.closest(`[data-testid="messageEntry"]`)
  if (dm) {
    root.classList.add('dialect-dm')
    tweetText.parentElement?.parentElement?.prepend(root)
  } else {
    tweetText.parentElement?.append(root)
  }
  return root
}

function addStyles(element: HTMLElement) {
  if (element && element.classList.contains('dialect-wrapper')) {
    element.style.marginTop = '12px'
    if (element.classList.contains('dialect-dm')) {
      element.style.marginBottom = '8px'
      element.style.width = '100%'
      element.style.minWidth = '350px'
    }
  }
  return element
}

function findAllDomainsInText(element: Element) {
  const flatten = element.textContent
  const domains = 'lfg.blink'
  const domainRegex = new RegExp(`\\b${domains}\\b`, 'gi')
  const matches = flatten?.match(domainRegex)
  return matches
}

function findTweetTextContainer(element: Element) {
  return findElementByTestId(element, 'tweetText')
}
