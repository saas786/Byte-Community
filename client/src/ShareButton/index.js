import React from 'react';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Dropdown, Icon, Menu, message } from 'antd';

import AnalyticsUtil from '../utils/AnalyticsUtil';

const ShareButton = props => {
	const { children, post, author } = props;

	const { id: postId, videoSrc } = post;
	const { username } = author;

	const baseUrl = window.location.origin;
	const postUrl = `${baseUrl}/post/${postId}`;
	const socialShareWindowOptions =
		'toolbar=0,status=0,resizable=1,width=626,height=436';

	const handleMenuClick = ({ key }) => {
		switch (key) {
			case 'open':
				window.open(postUrl, '_blank');
				AnalyticsUtil.track('Open Post Link', {
					postId
				});
				break;
			case 'download':
				window.open(videoSrc, '_blank');
				AnalyticsUtil.track(
					'Download Video',
					{
						postId
					},
					false
				);
				break;
			case 'facebook':
				shareToFacebook();
				break;
			case 'twitter':
				shareToTwitter();
				break;
			default:
		}
	};

	const shareToFacebook = () => {
		const url = `https://facebook.com/sharer.php?display=popup&u=${postUrl}`;
		window.open(url, 'sharer', socialShareWindowOptions);

		AnalyticsUtil.track('Share Post Link', {
			provider: 'facebook'
		});
	};

	const shareToTwitter = () => {
		const shareText = `Check out this byte by ${username} on the byte community:`;

		const url = `http://twitter.com/intent/tweet?text=${shareText}&url=${postUrl}`;

		window.open(url, 'sharer', socialShareWindowOptions);

		AnalyticsUtil.track('Share Post Link', {
			provider: 'twitter'
		});
	};

	const onLinkCopied = () => {
		message.success('Post link has been copied.');
		AnalyticsUtil.track(
			'Copy Post Link',
			{
				postId
			},
			false
		);
	};

	const shareMenu = (
		<Menu onClick={handleMenuClick}>
			<Menu.Item key="open">
				<Icon type="link" /> Open link
			</Menu.Item>
			<Menu.Item key="copy">
				<CopyToClipboard text={postUrl} onCopy={onLinkCopied}>
					<span style={{ display: 'block' }}>
						<Icon type="copy" /> Copy link
					</span>
				</CopyToClipboard>
			</Menu.Item>
			<Menu.Item key="download">
				<Icon type="download" /> Download Video
			</Menu.Item>
			<Menu.Item key="facebook">
				<Icon type="facebook" /> Share to Facebook
			</Menu.Item>
			<Menu.Item key="twitter">
				<Icon type="twitter" /> Share to Twitter
			</Menu.Item>
		</Menu>
	);

	return (
		<Dropdown overlay={shareMenu} trigger={['click']}>
			{children}
		</Dropdown>
	);
};

export default ShareButton;
