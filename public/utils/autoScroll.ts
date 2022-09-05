

export function autoScroll(feed: HTMLDivElement) {

    const newMessage = feed.lastElementChild as Element;

    const { marginBottom, height } = getComputedStyle(newMessage);

    const newMessageHeight = parseInt(marginBottom) + parseInt(height);

    const visibleHeight = feed.offsetHeight;

    const containerHeight = feed.scrollHeight;

    const scrollOffset = visibleHeight + feed.scrollTop;


    console.log(containerHeight, newMessageHeight, scrollOffset)

    if (containerHeight - newMessageHeight <= scrollOffset + 5)
        feed.scrollTop = feed.scrollHeight;

}