import React, {
  useState,
  useEffect,
  useRef,
  Children,
  useContext,
  forwardRef
} from 'react'
import SubmitTextarea from 'components/SubmitTextarea'
import styled, { keyframes, css } from 'styled-components/macro'
import { makeStyles } from '@material-ui/core/styles'
import {
  CardContent,
  CardMedia,
  CardHeader,
  Card,
  IconButton,
  Button,
  Switch,
  List,
  ListItem,
  ListItemText,
  Slide,
  Snackbar,
  TextField,
  InputAdornment,
  TextareaAutosize,
  Paper
} from '@material-ui/core'
import { red } from '@material-ui/core/colors'
import { BsThreeDots } from 'react-icons/bs'
import { BiCheckCircle } from 'react-icons/bi'

import { useChat, useMultiSendMessage } from 'hooks/useSendMessage'
// import { MuiAlert } from '@material-ui/lab'
import Avatar from 'components/Avatar'
import {
  FaShare,
  FaHeart,
  FaComment,
  FaTelegramPlane,
  FaLink,
  FaHeartBroken,
  FaBug,
  FaRegCheckCircle,
  FaComments,
  FaCamera,
  FaCheck
} from 'react-icons/fa'
import {
  RiSendPlaneFill,
  RiChat3Fill,
  RiWhatsappFill,
  RiTwitterFill,
  RiMailFill,
  RiArrowRightSLine,
  RiArrowLeftSLine,
  RiCameraLine
} from 'react-icons/ri'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { SiGmail } from 'react-icons/si'
import { FiFlag, FiSearch, FiPlay } from 'react-icons/fi'
import { MdClose, MdFeedback, MdCheck, MdDelete, MdMoreHoriz } from 'react-icons/md'
import { useRouter } from 'next/router'
import {
  abbreviateNumber,
  isUrlImage,
  isAddedToHomescreen,
  timeSince
} from 'libs'
import { BottomNavVisibilityContext } from './layout/Layout'
import {
  motion,
  useCycle,
  useAnimation,
  AnimatePresence,
  AnimateSharedLayout
} from 'framer-motion'
import { useDrag, useGesture } from 'react-use-gesture'
import { BottomSheet } from './BottomSheet'
import { isAndroid, isSafari } from 'react-device-detect'
import Vid from 'components/video-player'
import PlaySkeleton from 'components/PlaySkeleton'
import Skeleton from 'components/Skeleton'
import PlayIconAnimated from 'components/PlayIconAnimated'
import DollarIcon from 'components/DollarIcon'
import useSWR, { useSWRInfinite } from 'swr'
import RippleTextarea from 'components/RippleTextarea'
import { useInput, useMultiSelectableList, useToggle } from 'rooks'
import LoadingDots from 'components/LoadingDots'
import RippleInput from 'components/RippleInput'
import useSSR from 'use-ssr'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { shareLink } from 'state/chats'
import usePortal from 'react-useportal'
import NumberInput from 'components/NumberInput'
import useLoginSheet from 'hooks/use-login-sheet'
import {
  SharePostsWrap,
  DrawerSection,
  ShareButton,
  sharePostsVariants,
  DrawerTitle,
  LinkWasCopied,
  ShareWithinApp,
  ShareViaText,
  ShareViaWhatsApp,
  ShareToTwitter,
  ShareViaEmail,
  ShareViaGmail,
  ShareViaReddit,
  ShareViaTelegram
} from './Share/SharePostsComponents'
import copy from 'libs/copy'
import SearchWhoToSendToSheet from './Share/SearchWhoToSendSheet'
import SendToRecentlyChattedSheet from './Share/SendToRecentlyChattedSheet'
import {
  isHomeTopNavVisible,
  isFullscreenControlsVisible,
  videoIsSeeking
} from 'state'
import useVideo from 'hooks/use-video'
import useMe from 'hooks/use-me'
import {
  buyOrSubscribeSheetOpen,
  confirmPaymentModalData,
  enterFullscreenPostFunc
} from 'state/payments'
import { BuyOrSubscribeSheet } from 'components/BuyOrSubscribeSheet'
import InfiniteScroll from 'react-infinite-scroll-component'
import qs from 'qs'

import usePhoneCodeSheet from 'hooks/use-phone-code-sheet'
import PhoneCodeSheet from 'components/PhoneCodeSheet'
import Input from 'components/Input'
import useSnackbar from 'hooks/use-snackbar'
import { useSession } from 'next-auth/client'
import DeleteModal from 'components/Modal'
import CommentsSheet from 'components/CommentsSheet'
import TipSheet from 'components/TipSheet'
import SharePostSheet from 'components/ShareSheet'
import ReportPostSheet from 'components/ReportPostSheet'
import FeedbackPostSheet from 'components/FeedbackPostSheet'
import AddPhoneNumberSheet from 'components/AddPhoneNumberSheet'
import ClickMoreDetails from './ClickMoreDetails'
import ConfirmPaymentModal from 'components/ConfirmPaymentModal'

export default function Post(props) {
  const {
    likesCount,
    media,
    commentsCount,
    caption,
    creator,
    index,
    isLiked: originalLiked,
    requestEnterFullScreen,
    requestExitFullScreen,
    id,
    onRemove,
    isExpanded,
    isPaidFor,
    toggleScrollLock,
    currentVideo,
    purchaseOptions = [],
    hasPaidVideo
  } = props
  const user = useMe()
  const my = useMe()
  const [session, loading] = useSession()
  const isMyPost = my?.profileId === (creator.id || creator.profileId)
  const [isShowingComments, setIsShowingComments] = useState(false)
  const [isShowingTip, setIsShowingTip] = useState(false)
  const [isShowingOptions, setIsShowingOptions] = useState(false)
  // const setIsShowingBuyOrSubscribe = useSetRecoilState(buyOrSubscribeSheetOpen)
  const [isShowingBuyOrSubscribe, setIsShowingBuyOrSubscribe] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isSearchingWhoToSendTo, setIsSearchingWhoToSendTo] = useState(false)
  const [isSendingToRecentlyChatted, setIsSendingToRecentlyChatted] = useState(
    false
  )
  const [isReportingPost, setIsReportingPost] = useState(false)
  const [isPostingFeedback, setIsPostingFeedback] = useState(false)
  const [isAddingPhone, setIsAddingPhone] = useState(false)
  const [isReportingProfile, setIsReportingProfile] = useState(false)
  const { showBottomNav, hideBottomNav } = useContext(
    BottomNavVisibilityContext
  )
  const [isLiked, setIsLiked] = useState(originalLiked)
  const [isCaptionCollapsed, setIsCaptionCollapsed] = useState(true)

  const { push } = useRouter()
  const setIsTopNavVisible = useSetRecoilState(isHomeTopNavVisible)
  const video = useVideo(`post-video-${index}`)
  function enterFullscreenPost() {
    requestEnterFullScreen()
    setIsTopNavVisible(false)
    hideBottomNav()
    video.muted = false
    video.play(true)
  }
  function exitFullscreenPost() {
    requestExitFullScreen()
    setIsTopNavVisible(true)
    showBottomNav()
  }
  const onLike = async () => {
    setIsLiked(!isLiked)
    const response = await fetch('/api/like/post', {
      method: 'POST',
      body: JSON.stringify({
        postID: id,
        creator: creator.profileId
      })
    })
  }

  const checkSubscribe = async () => {
    const response = await fetch('/api/pay/subscribeGet', {
      method: 'POST',
      body: JSON.stringify({
        creator
      })
    })

    let result = await response.json()
    if (result.success || isPaidFor) {
      return enterFullscreenPost()
    } else {
      // this is awful, fix Slider to have a hook where we can requestFullScreen by postId
      setEnterFullscreenPost(() => enterFullscreenPost)
      setIsShowingBuyOrSubscribe(true)
    }
  }

  // checking if caption is fully opened or not
  const onClickCaptionMoreOrLess = captionCollapsedStatus => {
    setIsCaptionCollapsed(captionCollapsedStatus)
    toggleScrollLock(captionCollapsedStatus)
  }

  const { openLoginSheet } = useLoginSheet()
  const setSharePostId = useSetRecoilState(shareLink)
  const setEnterFullscreenPost = useSetRecoilState(enterFullscreenPostFunc)
  const { sendCode, isVerified, setPhone, close, isOpen } = usePhoneCodeSheet()
  const [isAddPhoneSheetVisible, setIsAddPhoneSheetVisible] = useState(false)

  const isShowFullVideo = purchaseOptions?.length && hasPaidVideo && media
  return (
    <>
      <motion.div
        style={{
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        <Media
          isExpanded={isExpanded}
          isCaptionCollapsed={isCaptionCollapsed}
          exitFullscreenPost={exitFullscreenPost}
          index={index}
          media={media}
          currentVideo={currentVideo}
        >
          <PostBottomLayout isFullScreenVideo={isExpanded}>
            <PostBottomLeft>
              <PostLeft>
                <Row css={'align-items: center;'}>
                  <div
                    onClick={() =>
                      push(
                        '/profile/[username]',
                        `/profile/${creator.username}`,
                        { shallow: true }
                      )
                    }
                    css={`
                      font-size: 14px;
                      display: flex;
                      align-items: center;
                      margin-right: 8px;
                    `}
                  >
                    <ProfileAvatar src={creator.image} />
                    <div
                      css={`
                        display: -webkit-box;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        text-overflow: ellipsis;
                      `}
                    >
                      {creator.name}
                    </div>
                    {typeof creator.age === 'number' && (
                      <span
                        css={`
                          font-size: 18;
                          margin: 0 6px;
                          font-weight: initial;
                        `}
                      >
                        {creator.age}
                      </span>
                    )}
                  </div>
                  {!isMyPost && <FollowButton {...creator} my={user} />}
                </Row>
                {caption && <ClickMoreDetails
                  onClickMoreOrLess={onClickCaptionMoreOrLess}
                  onClickOutsideContent={() => onClickCaptionMoreOrLess(true)}
                  content={caption}
                />}

              </PostLeft>
              <PostActionIcons>
                <HeartIcon isLiked={isLiked} onClick={onLike} />
                <CommentIcon onClick={() => setIsShowingComments(true)}/>
                <ShareIcon onClick={() => {
                  setIsSharing(true)
                  setSharePostId(id)
                }} />
                <DollarIcon
                  onClick={() => setIsShowingTip(true)}
                  css={`
                    height: 40px;
                    width: 40px;
                    border: 1px solid transparent;
                    padding: 7.5px;
                    padding-left: 0px;
                    margin-right: 0px;
                  `}
                />
                {isMyPost && <OptionIcon onClick={() => setIsShowingOptions(true)} />}

              </PostActionIcons>
            </PostBottomLeft>
            <PostBottomRight>
              <Row
                animate={!isShowFullVideo ? { bottom: 5 } : isExpanded ? { bottom: 6 } : { bottom: 33 }}
                css={`
                  justify-content: flex-end;
                  grid-area: like-comment;
                  margin-left:
                  color: rgb(250, 250, 250, 0.55);
                  position: relative;
                  bottom: 6px;
                  right: 16px;
                  & > div {
                    margin-left: 8px;
                  }
                `}
              >
                {likesCount > 0 && (
                  <SubText>
                    <FaHeart css={'margin-right: 8px;'} />
                    {abbreviateNumber(likesCount)}
                  </SubText>
                )}
                {commentsCount > 0 && (
                  <SubText>
                    <FaComment css={'margin-right: 8px;'} />
                    {abbreviateNumber(commentsCount)}
                  </SubText>
                )}
              </Row>
              <AnimatePresence>
                {!isExpanded && isShowFullVideo && (
                  <PostPlayButton
                    initial={{
                      opacity: 0,
                      y: '100px',
                      transition: {
                        type: 'tween'
                      }
                    }}
                    animate={{
                      opacity: 1,
                      y: '0',
                      transition: {
                        type: 'tween'
                      }
                    }}
                    exit={{
                      opacity: 0,
                      y: '100px',
                      transition: {
                        type: 'tween'
                      }
                    }}
                    onClick={async () => {
                      // return enterFullscreenPost()
                      if (my.userIsSignedOut) {
                        const callback = {
                          url: location.href + `&postId=${id}`
                          // orderDetails: {
                          // subscriptionId: '',
                          // performerId: '',
                          // type: '', // chat-message, profile, post
                          // }
                        }
                        return openLoginSheet(callback)
                      }
                      checkSubscribe()
                    }}
                  >
                    <PlayIconAnimated css={'font-size: 1.3rem;'} />
                    <ShimmerText>Full Video</ShimmerText>
                  </PostPlayButton>
                )}
              </AnimatePresence>
            </PostBottomRight>
          </PostBottomLayout>
        </Media>
      </motion.div>
      <ConfirmPaymentModal closeBuyOrSubscribeSheet={() => setIsShowingBuyOrSubscribe(false)}/>
      <CommentsSheet
        postID={id}
        profileId={my?.profileId}
        isVisible={isShowingComments}
        onClose={() => setIsShowingComments(false)}
      />
      <TipSheet
        isVisible={isShowingTip}
        onClose={() => setIsShowingTip(false)}
        my={my}
        creator={creator}
        postID={id}
      />
      <OptionsSheet
        postID={id}
        isVisible={isShowingOptions}
        onRemove={onRemove}
        onClose={() => setIsShowingOptions(false)}
      />
      <BuyOrSubscribeSheet
        length={video.duration}
        performer={creator}
        purchaseOptions={purchaseOptions}
        isVisible={isShowingBuyOrSubscribe}
        onClose={() => setIsShowingBuyOrSubscribe(false)}
        postID={id}
      />
      <SharePostSheet
        postId={id}
        isSharing={isSharing}
        onClose={() => setIsSharing(false)}
        my={my}
        onOpenRecentlyChatted={url => {
          setSharePostId(id)
          setIsSendingToRecentlyChatted(true)
          setIsSharing(false)
        }}
        onOpenSearch={() => setIsSearchingWhoToSendTo(true)}
        onOpenReportPost={() => {
          setIsSharing(false)
          const isPhoneVerified = my.verifiedPhones?.length ?? 0
          if (isPhoneVerified === 0) {
            setIsAddPhoneSheetVisible(true)
          } else {
            setIsReportingPost(true)
          }
        }}
        onOpenFeedbackPost={() => {
          setIsSharing(false)
          setIsPostingFeedback(true)
        }}
      />
      <SendToRecentlyChattedSheet
        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${id}`}
        isVisible={isSendingToRecentlyChatted}
        onClose={() => {
          setIsSendingToRecentlyChatted(false)
          setIsSharing(false)
        }}
        my={my}
      />
      <SearchWhoToSendToSheet
        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${id}`}
        isVisible={isSearchingWhoToSendTo}
        onClose={() => setIsSearchingWhoToSendTo(false)}
        my={my}
      />
      <PhoneCodeSheet
        isOpen={isOpen}
        onVerifyComplete={() => {
          close()
          setIsReportingPost(true)
          my.refresh()
        }}
      />
      <AddPhoneNumberSheet
        height={240}
        isVisible={isAddPhoneSheetVisible}
        onClose={() => {
          setIsAddPhoneSheetVisible(false)
        }}
        onPhoneInputChange={e => setPhone(e.target.value)}
        onClickAddPhone={async () => {
          try {
            const { ok } = await sendCode()
            if (ok) setIsAddPhoneSheetVisible(false)
          } catch (error) {
            console.log('Error while sending code: ', error)
          }
        }}
      />
      <ReportPostSheet
        postId={id}
        isVisible={isReportingPost}
        closeShareSheet={() => {
          setIsSharing(false)
          setIsReportingPost(false)
        }}
        onClose={() => setIsReportingPost(false)}
        my={my}
        creatorId={creator.profileId}
      />
      <FeedbackPostSheet
        postId={id}
        isVisible={isPostingFeedback}
        closeShareSheet={() => setIsSharing(false)}
        my={my}
        onClose={() => setIsPostingFeedback(false)}
      />
    </>
  )
}
const HeartIcon = styled(({ isLiked, ...props }) => <FaHeart {...props} />)`
  color: ${p => (p.isLiked ? 'limegreen' : 'rgb(250,250,250, .55)')};
  font-size: 1.45rem;
  height: 40px;
  width: 40px;
  border: 1px solid transparent;
  padding:7.5px;
`
const CommentIcon = styled(FaComment)`
  font-size: 1.45rem;
  height: 40px;
  width: 40px;
  border: 1px solid transparent;
  padding:7.5px;
`
const OptionIcon = styled(MdMoreHoriz)`
  margin-right: 16px;
  font-size: 1.45rem;
`
const ShareIcon = styled(FaShare)`
  font-size: 1.45rem;
  height: 40px;
  width: 40px;
  border: 1px solid transparent;
  padding:7.5px;
`
const ItemText = styled(ListItemText)`
  & > p.MuiTypography-colorTextSecondary {
    color: white;
  }
`

const PhoneInput = styled.input`
  padding: 3px 10px;
  border-radius: 34px;
  margin: 20px 0px;
  width: 100%;
  height: 36px;
  background-color: #6b7280 !important;
  &::placeholder {
    color: #86FA00;
  }
  &:-webkit-autofill,
  &:-webkit-autofill:hover, 
  &:-webkit-autofill:focus, 
  &:-webkit-autofill:active {
    -webkit-text-fill-color: white !important;
    -webkit-box-shadow: 0 0 0px 1000px #6b7280 inset !important;
    background-color: #6b7280 !important;
    background-clip: content-box !important;
  }
  /* &:-webkit-autofill {
    -webkit-text-fill-color: white !important;
    -webkit-box-shadow: 0 0 0px 1000px #6b7280 inset !important;
  } */
  /* .MuiInputBase-input, .MuiInput-underline:before, .MuiInput-underline:hover, .MuiInput-underline:after {
    border: none;
    content: none;
    text-align: center;
  } */
`
const SendButton = ({ children, ...props }) => (
  <OuterBtn {...props}>
    <InnerBtn>{children}</InnerBtn>
  </OuterBtn>
)
const OuterBtn = styled.div`
  height: 100%;
  display: flex;
  align-items: flex-end;
`
const InnerBtn = styled.div`
  color: limegreen;
  font-weight: bold;
  margin-bottom: 2px;
`
const SendTipButton = styled(SendButton)`
  && > div {
    color: black !important;
    border-radius: 18px;
    background: limegreen;
    width: 62px;
    height: 24px;
    padding: 4px 6px;
    position: absolute;
    right: -3px;
    bottom: -1px;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    margin-right: 2px;
  }
`
const FollowButton = ({ isFollowing, profileId, my }) => {
  const { openLoginSheet } = useLoginSheet()
  const [following, toggle] = useToggle(isFollowing)
  const follow = async () => {
    if (!my?.profileId) return openLoginSheet()
    toggle()
    const response = await fetch(`/api/follow?toFollow=${profileId}`)
    if (!response.ok) {
      toggle()
      // TODO: error handling
    }
  }
  return (
    <div
      onClick={follow}
      css={`
        font-size: 14;
        font-weight: bold;
      `}
    >
      {following ? 'Following' : 'Follow'}
    </div>
  )
}
const PostBottomRight = styled(motion.div)`
  display: inline-grid;
  place-content: end;
  grid-area: right;
  min-width: 100px;
  padding: 0 7.5px 7.5px 0;
`
const PostBottomLeft = styled(motion.div)`
  grid-area: left;
`
const PostBottomLayout = styled(motion.div)`
  width: 100%;
  z-index: 100;
  display: grid;
  grid-template-areas: "left right";
  margin: auto 0
    ${props => (props.isFullScreenVideo && isAddedToHomescreen ? 28 : 0)}px;
  grid-template-columns: 1fr auto;
`
const PostLeft = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: left;
  margin: auto 12px 0;
`
const PostActionIcons = styled.div`
  color: rgb(250, 250, 250, 0.55);
  display: flex;
  align-items: center;
  margin-top: 1rem;
  bottom:0;
`
const BoxShadowMedia = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-shadow: 0 76px 52px -40px rgba(0, 0, 0, 0.66) inset,
    0 ${p => (p.isFullScreenVideo ? -200 : -115)}px 70px -34px rgba(
        0,
        0,
        0,
        0.66
      ) inset;
`
// const ThreeDots = styled(BsThreeDots)`
// font-size: 1.85rem;
// position: absolute;
// top: ${isAndroid && isAddedToHomescreen ? 36 : 16}px;
// right: 16px;
// `
const ProfileAvatar = styled(Avatar)`
  margin-right: 8px;
`
const PostPlayButton = styled(motion.div)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  bottom: 6px;
  right: 12px;
`
const shimmer = keyframes`
0% { background-position: -4rem top; }
70% { background-position: 12.5rem top; }
100% { background-position: 12.5rem top; }
`
const ShimmerText = styled(motion.div)`
  margin-left: 8px;
  font-size: 1.15rem;
  display: inline-block;
  color: white;
  background: #ffffff -webkit-gradient(linear, 100% 0, 0 0, from(#ffffff), color-stop(0.5, #28ff41), to(#ffffff));
  background-position: -4rem top; /*50px*/
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation-name: ${shimmer};
  animation-duration: 5.2s;
  animation-iteration-count: infinite;
  background-size: 4rem 100%; /*50px*/
`
const SubText = styled.div`
  display: flex;
  align-items: center;
  font-weight: bold;
  color: rgb(250, 250, 250, 0.55);
  font-size: 0.75rem;
  margin-top: 4px;
  height: 0.75rem;
`
const Caption = styled.div`
  margin-top: 8px;
  display: block; /* backup in case -webkit-box not supported */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`
const useStyles = makeStyles(theme => ({
  root: {
    overflow: 'visible',
    background: 'black'
  },
  media: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  },
  avatar: {
    backgroundColor: red[500]
  }
}))
const CardMedia_ = styled(CardMedia)`
  width: 100%;
  height: inherit;
  position: absolute;
`
const CardHead = styled(CardHeader)`
  .MuiTypography-colorTextSecondary {
    color: white !important;
  }
`
const CardWrap = styled(Card)`
  position: relative;
  height: 100%;
  /* padding-bottom: 56px; */
`
const CardWrapInner = styled(motion.div)`
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  ${props => props.isExpanded && `padding-bottom: 50px;`}
`
const CardWrapImageHolder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  background-image: url(${props => props.img});
`
const Row = styled(motion.div)`
  display: flex;
`
const Col = styled.div`
  display: flex;
  flex-direction: column;
`
const ProfileDetails = styled.div`
  z-index: 10;
  margin-top: auto;
  flex-direction: column;
  display: flex;
  position: relative;
  padding: 12px;
`
const Media = props => {
  const {
    index,
    media,
    children,
    isExpanded = false,
    exitFullscreenPost,
    currentVideo
  } = props
  const classes = useStyles()
  const id = `post-video-${index}`
  const video = useVideo(id)

  // useEffect(() => {
  //   if (currentVideo !== index) {
  //     const otherVideo = document.getElementById(`post-video-${index}`)
  //     if (otherVideo) {
  //       otherVideo.muted = true
  //       otherVideo.pause()
  //     }
  //   }
  // }, [currentVideo, index])

  // if (!index) console.log('(Media) video.showingControls', video.showingControls, 'isExpanded', isExpanded)
  return (
    <CardWrap className={classes.root}>
      <CardWrapInner isExpanded={isExpanded}>
        {isUrlImage(media.src) ? (
          <CardWrapImageHolder img={media.src} />
        ) : (
          <AnimateSharedLayout type='crossfade'>
            <Vid
              {...props}
              layoutId={`thecard-${index}`}
              isFullscreenExpanded={isExpanded}
              id={id}
              src={
                !isExpanded
                  ? media.src
                  : 'https://s3-us-west-1.amazonaws.com/alexcory.com/_burningman.mp4'
              }
              poster={!isExpanded && media.thumb}
              type={!isExpanded && media.mime}
              exitFullscreenPost={exitFullscreenPost}
            />
          </AnimateSharedLayout>
        )}
        <AnimatePresence>
          <BoxShadowMedia
            isFullScreenVideo={isExpanded}
            variants={{
              open: { opacity: 1, transition: { duration: 0.25 } },
              closed: { opacity: 0, transition: { duration: 0.4 } }
            }}
            animate={video.showingControls || !isExpanded ? 'open' : 'closed'}
            onClick={() => {
              // in teaser view, 1st click unmutes, 2nd pauses
              if (!isExpanded && !video.paused && video.muted) {
                video.unmute()
              } else {
                video.click()
              }
            }}
          />
        </AnimatePresence>
        <AnimatePresence>
          <motion.div
            onClick={() => isExpanded && video.showControls()}
            css={`
              min-height: 100%;
              display: flex;
            `}
            variants={{
              open: { opacity: 1, transition: { duration: 0.25 } },
              closed: { opacity: 0, transition: { duration: 0.4 } }
            }}
            animate={video.showingControls || !isExpanded ? 'open' : 'closed'}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </CardWrapInner>
    </CardWrap>
  )
}

function OptionsSheet({ postID, isVisible, onRemove, onClose }) {
  const [isOpen, setIsOpen] = useState(false)
  const { push } = useRouter()

  const my = useMe()
  const snackbar = useSnackbar({
    styles: { backgroundColor: 'red' }
  })

  const removePost = async () => {
    const response = await fetch('/api/post/delete', {
      method: 'DELETE',
      body: JSON.stringify({
        postID
      })
    })
    if (response.ok) {
      setIsOpen(false)
      onClose && onClose()
      onRemove && onRemove(postID)
    } else {
      snackbar.open('Something Went Wrong')
    }
  }

  return (
    <>
      <BottomSheet isVisible={isVisible} onRequestClose={onClose} height={200}>
        {isOpen && (
          <DeleteModal setIsOpen={setIsOpen} isOpen={isOpen}>
            <div style={{ color: 'white', textAlign: 'center', paddingTop: 20 }}>
              Are you sure you want to remove this post?
              <br />
              Removing a post is permanent.
              <Buttons>
                <Btn onClick={() => setIsOpen(false)}>Cancel</Btn>
                <Btn style={{ borderLeft: '1px solid white' }} onClick={removePost}>Remove</Btn>
              </Buttons>
            </div>
          </DeleteModal>
        )}
        <EditPostButton
          onClick={() => {
            onClose()
            push(
              '/camera/edit-post',
              `/camera/edit-post/${postID}`,
              { shallow: true }
            )
          }}
        />
        <DeleteButton onClick={e => setIsOpen(true)} />
        <ClosePostButton onClick={() => onClose()} />
      </BottomSheet>
    </>
  )
}

const EditPostButton = styled(Button).attrs(() => ({
  children: 'Edit Post'
}))`
  border-radius: 0px;
  text-transform: none;
  &.MuiButton-root {
    padding-bottom: .75rem;
    width: 100%;
    color: rgba(133, 255, 0, 1);
    font-size: 20px;
  }
`

const DeleteButton = styled(Button).attrs(() => ({
  children: 'Delete'
}))`
  border-radius: 0px;
  text-transform: none;
  &.MuiButton-root {
    padding-bottom: .75rem;
    width: 100%;
    color: #ff4b4b;
    font-size: 20px;
    border-top: 1px solid #808080; 
  }
`

const ClosePostButton = styled(Button).attrs(() => ({
  children: 'Cancel'
}))`
  border-radius: 0px;
  text-transform: none;
  &.MuiButton-root {
    width: 100%;
    color: white;
    font-size: 20px;
    border-top: 1px solid #808080;
  }
`
const Buttons = styled.div`
  display: flex;
  border-top: 1px solid #DADADA;
  margin-top: 20px;
`
const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  height: 44px;
  width: 50%;
  color: rgba(133, 255, 0, 1);
  &:nth-child(2) {
    border-left: 1px solid #DADADA;
    font-weight: 600;
  }
`
