'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme/theme';
import { CompanyMessage } from '../../components/message/company';
import { UserMessage } from '../../components/message/user';

// テスト用サンプルメッセージ
const sampleMessages = [
  {
    label: 'サンプル1: リスト表示（ul）',
    question: 'ランク毎にどんな特典があるのか？',
    answer: `<p>主な特典は以下のとおりです。</p>
  <ul>
    <li>ポイント倍率アップ特典</li>
    <li>d払い特典</li>
    <li>dポイントマーケット利用特典</li>
    <li>料金充当特典 など</li>
  </ul>
  <p>
    ランクに応じて、dポイントカード提示や各種サービスをご利用時の進呈率がアップします。<br>
    詳しくはdポイントクラブの会員ランクとはでご確認ください。
  </p>`,
  },
  {
    label: 'サンプル2: 番号付きリスト（ol）+ 見出し（h3）+ 太字（strong）+ 水平線（hr）',
    question: '「dポイントご利用のお知らせ」メールの配信を停止したい。',
    answer: `<p>「dポイントご利用のお知らせ」などのメール配信を停止するには、以下の手順で設定を変更してください。</p>

<h3>■ 手順</h3>

<ol>
  <li>
    <strong>dポイントクラブサイトからの設定方法</strong>
    <ol>
      <li>dポイントクラブサイトにログインします。</li>
      <li>
        メニューから
        「その他の設定・確認」→「その他設定」→「Myインフォメール設定」
        を選択します。
      </li>
      <li>配信停止したいメールのチェックを外し、設定を保存します。</li>
    </ol>
    <p>※dポイントクラブサイトはこちらから確認ください。</p>
  </li>

  <li>
    <strong>dポイントクラブアプリからの設定方法</strong>
    <ol>
      <li>dポイントクラブアプリを起動し、ログインします。</li>
      <li>
        画面左上の「メニュー」→「関連サイト」→「dポイントクラブ」
        を選択します。
      </li>
      <li>その後は①と同様の手順で設定をお願いいたします。</li>
    </ol>
  </li>
</ol>

<hr>

<ul>
  <li>設定変更後、反映までに数日かかる場合があります。</li>
  <li>一部の重要なお知らせメールは停止できない場合があります。</li>
</ul>`,
  },
  {
    label: 'サンプル3: プレーンテキスト（HTMLタグなし）',
    question: 'テスト質問',
    answer: 'これはHTMLタグを含まないプレーンテキストのメッセージです。\n改行も正しく表示されるか確認します。',
  },
  {
    label: 'サンプル4: aタグ + spanタグ（既存の対応）',
    question: 'リンクのテスト',
    answer: '詳しくは<a href="https://example.com" target="_blank">こちら</a>をご確認ください。<span style="color: red; font-weight: bold">重要な情報</span>です。',
  },
  {
    label: 'サンプル5: castexタグ（動画展開）',
    question: '操作手順を動画で教えて',
    answer: `<p>以下の動画をご確認ください。</p><castex>https://estimate-all.s3.us-east-1.amazonaws.com/AdobeStock_356548790_vrew.mp4?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED4aCXVzLWVhc3QtMSJHMEUCIQCepvQfegyFVprdjpEF6XeaXwLRWY8EDUtaK3qi27EfcQIgQ0R9oj1yDMooQAfE%2FG%2BDfPsSpPgo0dF%2B3DYm5O3JZRoqlAMIBxAAGgw3MzAzMzUxOTAzMzAiDNb95jhFybIQswrvbSrxAkIRK5AQNMqp06KeMQbFJeni%2BYxlVH2evHZL%2FYibuqquK6ogiJQUr863Q98mBEBQ2ERj11oFSTlW42ZJfZ0JjlXy3YtYJ5hZpBSA1ftwnI3ISP6uhKalrNA2KqPkq5KruHE89Nn22RyjgwtQA3Bz482bewNiMolPaVkqMu24u9MeC7wrJDbQKLasP1PCVS2gL6Vtl3sHvPHg4hqKCcTQv6amM9yG3k8IZIEsTM8zV54nb3d85SaCJvjhAmAufAOW2kc6I%2BhIJxEveVPCsWqyEa2mfNBNsEkRg57blbEAcM31kzuI3nHMI41J9BruFj2eoM5k71fr5FdNRcWZK8XNEIyxRfg3A3q9nPxQMClcX93WeVk37zVCGx4d4fyUrvnAvvtxi5gWoJalk45BuwWMzP3nRLHJs6Prv%2BLk08FJWOEpsuhGsdXUmPSfpiuGzqcNzGLfq18vebIw0nhn1HI63e1cFV4cG9UxOVCdIt09WvAI0jC%2FmPrMBjqPAozNHqlUSmaxtssKfgmWe%2FAyUmr327zxHY0IGWVb0aaiGqaZqxwIQG0q7xyliNfv%2B9rzDn%2Fj%2FLlAzS7KQmxUpth6yh2i4Le9TSyUJZewpAagWFsYMMYrZMDVU%2F94kn1pRvo6VWkQ0QTjkTY%2BqlKFQ8tW%2BBaDB5Jv5WGIl0tu87uvaa2RxJJOkJyfs138eJgBowLkmo0tbMkzWHQmvs8aMooE2FpuQir7Ggy7ESzc11rVtJTaMfb5iv5csKAXA9VbMAVpW5f5Q24SaIVj44UAQ1XE4AfqisnhQXgXCNczFcESJjvGYReYimonyFnRqLae6dQidxuyC1m8OKWuuByRoc7ttae%2F93XmziZf14iu0o8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA2UC26TU5KIIPKKNZ%2F20260225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260225T054856Z&X-Amz-Expires=10800&X-Amz-SignedHeaders=host&X-Amz-Signature=dbf08fab807858c15921c6995ca3d86ac9512b81d9379c33305139e0546a7ccf</castex>`,
  },
  {
    label: 'サンプル6: castexタグのみ（テキストなし）',
    question: '動画だけ見たい',
    answer: `<castex>https://estimate-all.s3.us-east-1.amazonaws.com/AdobeStock_356548790_vrew.mp4?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED4aCXVzLWVhc3QtMSJHMEUCIQCepvQfegyFVprdjpEF6XeaXwLRWY8EDUtaK3qi27EfcQIgQ0R9oj1yDMooQAfE%2FG%2BDfPsSpPgo0dF%2B3DYm5O3JZRoqlAMIBxAAGgw3MzAzMzUxOTAzMzAiDNb95jhFybIQswrvbSrxAkIRK5AQNMqp06KeMQbFJeni%2BYxlVH2evHZL%2FYibuqquK6ogiJQUr863Q98mBEBQ2ERj11oFSTlW42ZJfZ0JjlXy3YtYJ5hZpBSA1ftwnI3ISP6uhKalrNA2KqPkq5KruHE89Nn22RyjgwtQA3Bz482bewNiMolPaVkqMu24u9MeC7wrJDbQKLasP1PCVS2gL6Vtl3sHvPHg4hqKCcTQv6amM9yG3k8IZIEsTM8zV54nb3d85SaCJvjhAmAufAOW2kc6I%2BhIJxEveVPCsWqyEa2mfNBNsEkRg57blbEAcM31kzuI3nHMI41J9BruFj2eoM5k71fr5FdNRcWZK8XNEIyxRfg3A3q9nPxQMClcX93WeVk37zVCGx4d4fyUrvnAvvtxi5gWoJalk45BuwWMzP3nRLHJs6Prv%2BLk08FJWOEpsuhGsdXUmPSfpiuGzqcNzGLfq18vebIw0nhn1HI63e1cFV4cG9UxOVCdIt09WvAI0jC%2FmPrMBjqPAozNHqlUSmaxtssKfgmWe%2FAyUmr327zxHY0IGWVb0aaiGqaZqxwIQG0q7xyliNfv%2B9rzDn%2Fj%2FLlAzS7KQmxUpth6yh2i4Le9TSyUJZewpAagWFsYMMYrZMDVU%2F94kn1pRvo6VWkQ0QTjkTY%2BqlKFQ8tW%2BBaDB5Jv5WGIl0tu87uvaa2RxJJOkJyfs138eJgBowLkmo0tbMkzWHQmvs8aMooE2FpuQir7Ggy7ESzc11rVtJTaMfb5iv5csKAXA9VbMAVpW5f5Q24SaIVj44UAQ1XE4AfqisnhQXgXCNczFcESJjvGYReYimonyFnRqLae6dQidxuyC1m8OKWuuByRoc7ttae%2F93XmziZf14iu0o8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA2UC26TU5KIIPKKNZ%2F20260225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260225T054856Z&X-Amz-Expires=10800&X-Amz-SignedHeaders=host&X-Amz-Signature=dbf08fab807858c15921c6995ca3d86ac9512b81d9379c33305139e0546a7ccf</castex>`,
  },
];

export default function TestPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '16px',
        backgroundColor: '#F5F5F5',
        minHeight: '100vh',
      }}>
        <Typography variant="h5" sx={{
          fontFamily: '"Noto Sans", sans-serif',
          fontWeight: 700,
          marginBottom: '24px',
          color: '#333',
        }}>
          HTML表示 検証ページ
        </Typography>

        {sampleMessages.map((sample, index) => (
          <Box key={index} sx={{ marginBottom: '32px' }}>
            {/* ラベル */}
            <Typography sx={{
              fontFamily: '"Noto Sans", sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              color: '#666',
              backgroundColor: '#E0E0E0',
              padding: '4px 8px',
              borderRadius: '4px',
              marginBottom: '12px',
            }}>
              {sample.label}
            </Typography>

            {/* ユーザーメッセージ */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding: '4px 8px' }}>
              <UserMessage message={sample.question} />
            </Box>

            {/* 企業メッセージ */}
            <Box sx={{ width: '100%', padding: '4px 8px' }}>
              <CompanyMessage message={sample.answer} />
            </Box>
          </Box>
        ))}
      </Box>
    </ThemeProvider>
  );
}
