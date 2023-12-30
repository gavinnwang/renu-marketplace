import Svg, { Circle, Path } from "react-native-svg";

export default function Logo() {
  return (
    <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <Circle cx="15.3654" cy="15.3654" r="15.3654" fill="#181818" />
      <Circle cx="15.3654" cy="15.3654" r="15.3654" fill="#181818" />
      <Path
        d="M11.4369 10.2801C11.8344 10.8281 11.6996 11.5874 11.2463 12.0903C9.43387 14.1013 9.21459 17.1819 10.878 19.4748C12.7855 22.1041 16.4559 22.703 19.0723 20.8048C21.6887 18.9067 22.261 15.2353 20.351 12.6024L19.2344 13.4125C18.7666 13.7518 18.1208 13.362 18.2033 12.79L18.8847 8.06085C18.9372 7.69599 19.2809 7.4467 19.644 7.50995L24.3511 8.32987C24.9204 8.42904 25.0906 9.16391 24.6228 9.50326L23.5062 10.3133C26.6871 14.6979 25.7329 20.819 21.3758 23.98C17.0186 27.1409 10.9036 26.1484 7.72273 21.7638C5.08742 18.1313 5.29042 13.3067 7.91535 9.96112C8.83474 8.78932 10.5622 9.07451 11.4369 10.2801Z"
        fill="#F9F9F9"
      />
      <Path
        d="M11.4369 10.2801C11.8344 10.8281 11.6996 11.5874 11.2463 12.0903C9.43387 14.1013 9.21459 17.1819 10.878 19.4748C12.7855 22.1041 16.4559 22.703 19.0723 20.8048C21.6887 18.9067 22.261 15.2353 20.351 12.6024L19.2344 13.4125C18.7666 13.7518 18.1208 13.362 18.2033 12.79L18.8847 8.06085C18.9372 7.69599 19.2809 7.4467 19.644 7.50995L24.3511 8.32987C24.9204 8.42904 25.0906 9.16391 24.6228 9.50326L23.5062 10.3133C26.6871 14.6979 25.7329 20.819 21.3758 23.98C17.0186 27.1409 10.9036 26.1484 7.72273 21.7638C5.08742 18.1313 5.29042 13.3067 7.91535 9.96112C8.83474 8.78932 10.5622 9.07451 11.4369 10.2801Z"
        fill="#F9F9F9"
      />
    </Svg>
  );
}

export function BigLogo() {
  return (
    <Svg width="56" height="55" viewBox="0 0 56 55" fill="none">
      <Circle cx="27.1991" cy="27.1991" r="27.1991" fill="black" />
      <Path
        d="M20.2448 18.198C20.9486 19.1681 20.7099 20.5121 19.9076 21.4023C16.6992 24.9622 16.3111 30.4153 19.2556 34.474C22.6321 39.1283 29.1293 40.1885 33.7607 36.8285C38.3922 33.4685 39.4053 26.9695 36.0242 22.3089L34.0476 23.7428C33.2196 24.3435 32.0765 23.6534 32.2224 22.6409L33.4286 14.2696C33.5216 13.6238 34.1299 13.1825 34.7728 13.2945L43.105 14.7459C44.1128 14.9214 44.4141 16.2222 43.5861 16.8229L41.6095 18.2569C47.2401 26.0182 45.551 36.8535 37.8382 42.449C30.1254 48.0444 19.3009 46.2874 13.6702 38.526C9.00533 32.0959 9.36467 23.5557 14.0112 17.6334C15.6387 15.5591 18.6966 16.064 20.2448 18.198Z"
        fill="white"
      />
    </Svg>
  );
}

export function LogoWithText(props: { className?: string }) {
  return (
    <Svg
      width="106"
      height="31"
      viewBox="0 0 106 31"
      fill="none"
      className={props.className}
    >
      <Path
        d="M49.154 25L45.15 17.928H43.434V25H39.794V6.852H46.606C48.01 6.852 49.206 7.10333 50.194 7.606C51.182 8.09133 51.9187 8.75867 52.404 9.608C52.9067 10.44 53.158 11.376 53.158 12.416C53.158 13.612 52.8113 14.6953 52.118 15.666C51.4247 16.6193 50.3933 17.278 49.024 17.642L53.366 25H49.154ZM43.434 15.198H46.476C47.464 15.198 48.2007 14.964 48.686 14.496C49.1713 14.0107 49.414 13.3433 49.414 12.494C49.414 11.662 49.1713 11.0207 48.686 10.57C48.2007 10.102 47.464 9.868 46.476 9.868H43.434V15.198ZM69.8403 17.486C69.8403 18.006 69.8056 18.474 69.7363 18.89H59.2063C59.2929 19.93 59.6569 20.7447 60.2983 21.334C60.9396 21.9233 61.7283 22.218 62.6643 22.218C64.0163 22.218 64.9783 21.6373 65.5503 20.476H69.4763C69.0603 21.8627 68.2629 23.0067 67.0843 23.908C65.9056 24.792 64.4583 25.234 62.7423 25.234C61.3556 25.234 60.1076 24.9307 58.9983 24.324C57.9063 23.7 57.0483 22.8247 56.4243 21.698C55.8176 20.5713 55.5142 19.2713 55.5142 17.798C55.5142 16.3073 55.8176 14.9987 56.4243 13.872C57.0309 12.7453 57.8803 11.8787 58.9723 11.272C60.0643 10.6653 61.3209 10.362 62.7423 10.362C64.1116 10.362 65.3336 10.6567 66.4083 11.246C67.5003 11.8353 68.3409 12.676 68.9303 13.768C69.5369 14.8427 69.8403 16.082 69.8403 17.486ZM66.0703 16.446C66.0529 15.51 65.7149 14.7647 65.0563 14.21C64.3976 13.638 63.5916 13.352 62.6383 13.352C61.7369 13.352 60.9743 13.6293 60.3503 14.184C59.7436 14.7213 59.3709 15.4753 59.2323 16.446H66.0703ZM80.4791 10.388C82.1951 10.388 83.5818 10.934 84.6391 12.026C85.6965 13.1007 86.2251 14.6087 86.2251 16.55V25H82.5851V17.044C82.5851 15.9 82.2991 15.0247 81.7271 14.418C81.1551 13.794 80.3751 13.482 79.3871 13.482C78.3818 13.482 77.5845 13.794 76.9951 14.418C76.4231 15.0247 76.1371 15.9 76.1371 17.044V25H72.4971V10.596H76.1371V12.39C76.6225 11.766 77.2378 11.2807 77.9831 10.934C78.7458 10.57 79.5778 10.388 80.4791 10.388ZM103.285 10.596V25H99.6186V23.18C99.1506 23.804 98.5352 24.298 97.7726 24.662C97.0272 25.0087 96.2126 25.182 95.3286 25.182C94.2019 25.182 93.2052 24.948 92.3386 24.48C91.4719 23.9947 90.7872 23.2927 90.2846 22.374C89.7992 21.438 89.5566 20.3287 89.5566 19.046V10.596H93.1966V18.526C93.1966 19.67 93.4826 20.554 94.0546 21.178C94.6266 21.7847 95.4066 22.088 96.3946 22.088C97.3999 22.088 98.1886 21.7847 98.7606 21.178C99.3326 20.554 99.6186 19.67 99.6186 18.526V10.596H103.285Z"
        fill="#181818"
      />
      <Circle cx="15.3654" cy="15.3654" r="15.3654" fill="#181818" />
      <Circle cx="15.3654" cy="15.3654" r="15.3654" fill="#181818" />
      <Path
        d="M11.4369 10.2801C11.8344 10.8281 11.6996 11.5874 11.2463 12.0903C9.43387 14.1013 9.21459 17.1819 10.878 19.4748C12.7855 22.1041 16.4559 22.703 19.0723 20.8048C21.6887 18.9067 22.261 15.2353 20.351 12.6024L19.2344 13.4125C18.7666 13.7518 18.1208 13.362 18.2033 12.79L18.8847 8.06085C18.9372 7.69599 19.2809 7.4467 19.644 7.50995L24.3511 8.32987C24.9204 8.42904 25.0906 9.16391 24.6228 9.50326L23.5062 10.3133C26.6871 14.6979 25.7329 20.819 21.3758 23.98C17.0186 27.1409 10.9036 26.1484 7.72273 21.7638C5.08742 18.1313 5.29042 13.3067 7.91535 9.96112C8.83474 8.78932 10.5622 9.07451 11.4369 10.2801Z"
        fill="#F9F9F9"
      />
      <Path
        d="M11.4369 10.2801C11.8344 10.8281 11.6996 11.5874 11.2463 12.0903C9.43387 14.1013 9.21459 17.1819 10.878 19.4748C12.7855 22.1041 16.4559 22.703 19.0723 20.8048C21.6887 18.9067 22.261 15.2353 20.351 12.6024L19.2344 13.4125C18.7666 13.7518 18.1208 13.362 18.2033 12.79L18.8847 8.06085C18.9372 7.69599 19.2809 7.4467 19.644 7.50995L24.3511 8.32987C24.9204 8.42904 25.0906 9.16391 24.6228 9.50326L23.5062 10.3133C26.6871 14.6979 25.7329 20.819 21.3758 23.98C17.0186 27.1409 10.9036 26.1484 7.72273 21.7638C5.08742 18.1313 5.29042 13.3067 7.91535 9.96112C8.83474 8.78932 10.5622 9.07451 11.4369 10.2801Z"
        fill="#F9F9F9"
      />
    </Svg>
  );
}