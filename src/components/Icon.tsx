type Props = {
  icon: string;
};

// 이모지 문자는 그대로 렌더링하고, 이미지 경로("/"로 시작)면 <img>로 대체한다.
// 1em 크기로 맞춰서 부모 요소의 text-* 크기를 그대로 따라간다.
export default function Icon({ icon }: Props) {
  if (icon.startsWith("/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icon}
        alt=""
        className="inline-block align-middle object-contain"
        style={{ width: "1em", height: "1em" }}
      />
    );
  }
  return <>{icon}</>;
}
