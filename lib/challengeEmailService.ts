import nodemailer from 'nodemailer'
import { Challenge, CHALLENGE_TEMPLATES } from '@/types/challenge'

if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
  console.warn('Warning: SMTP_EMAIL or SMTP_PASSWORD not set — email sending will fail.')
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export interface ChallengeEmailContext {
  userEmail: string
  userName: string
  challenge: Challenge
  timeUntilDeadline?: string
  streakCount?: number
  completionPercentage?: number
  pointsEarned?: number
  missedDays?: number
}

// Welcome Email - Challenge Started
export async function sendChallengeWelcomeEmail(context: ChallengeEmailContext) {
  try {
    const { userEmail, userName, challenge } = context
    const template = CHALLENGE_TEMPLATES[challenge.challengeType as keyof typeof CHALLENGE_TEMPLATES]
    const targetVideos = template?.targetVideos || Math.ceil((challenge.durationMonths || 1) * 30 / (challenge.cadenceEveryDays || 1))

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .tips { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Challenge Started!</h1>
              <h2>${challenge.challengeTitle}</h2>
              <p>Welcome to your YouTube consistency journey, ${userName}!</p>
            </div>
            
            <div class="content">
              <p>Congratulations! You've just started your <strong>${challenge.challengeTitle}</strong> challenge. Here's what you've committed to:</p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${targetVideos}</div>
                  <div>Total Videos</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${challenge.durationMonths || Math.ceil((challenge.durationMonths || 1) * 30 / 30)}</div>
                  <div>Months</div>
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">Every ${challenge.cadenceEveryDays || 1}</div>
                  <div>Day(s)</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${challenge.videoType || 'Mixed'}</div>
                  <div>Video Type</div>
                </div>
              </div>

              <div class="tips">
                <h3>💡 Success Tips:</h3>
                <ul>
                  <li><strong>Plan ahead:</strong> Create a content calendar with video ideas</li>
                  <li><strong>Batch create:</strong> Film multiple videos when you have time</li>
                  <li><strong>Stay consistent:</strong> Upload at the same time each day/week</li>
                  <li><strong>Track progress:</strong> Use our dashboard to monitor your streak</li>
                  <li><strong>Don't give up:</strong> Even if you miss a day, get back on track immediately</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge" class="cta-button">
                  View Challenge Dashboard
                </a>
              </div>

              <p>We'll send you reminder emails before each deadline to help you stay on track. You can adjust these notifications in your settings anytime.</p>
              
              <p>Ready to build the ultimate YouTube habit? Let's go! 🎬</p>
            </div>

            <div class="footer">
              <p>Good luck with your challenge!</p>
              <p>The YT-AI Team</p>
              <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings">Notification Settings</a> | <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge">Dashboard</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"YT-AI Challenges" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `🚀 Your ${challenge.challengeTitle} has started!`,
      html: htmlContent
    })

    console.log(`Welcome email sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
}

// Upload Reminder Email
export async function sendUploadReminderEmail(context: ChallengeEmailContext) {
  try {
    const { userEmail, userName, challenge, timeUntilDeadline } = context
    const urgency = timeUntilDeadline?.includes('hour') ? 'urgent' : 'normal'
    const urgencyColor = urgency === 'urgent' ? '#ef4444' : '#3b82f6'
    const urgencyEmoji = urgency === 'urgent' ? '⏰' : '📅'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: ${urgencyColor}; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .deadline-box { background: ${urgencyColor}15; border: 2px solid ${urgencyColor}; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .deadline-time { font-size: 24px; font-weight: bold; color: ${urgencyColor}; margin: 10px 0; }
            .progress-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 18px; font-weight: bold; color: #334155; }
            .cta-button { background: ${urgencyColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .tips { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${urgencyEmoji} Upload Reminder</h1>
              <h2>${challenge.challengeTitle}</h2>
              <p>Don't break your streak, ${userName}!</p>
            </div>
            
            <div class="content">
              <div class="deadline-box">
                <h3>⏰ Your next upload is due</h3>
                <div class="deadline-time">${timeUntilDeadline || 'Soon'}</div>
                <p>Keep your consistency streak alive!</p>
              </div>

              <p>Hi ${userName},</p>
              <p>This is a friendly reminder that your next video upload for the <strong>${challenge.challengeTitle}</strong> is coming up.</p>

              <h3>📊 Your Progress So Far:</h3>
              <div class="progress-stats">
                <div class="stat">
                  <div class="stat-number">${challenge.uploads?.length || 0}</div>
                  <div>Videos Uploaded</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${challenge.streakCount || 0}</div>
                  <div>Current Streak</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${Math.round(challenge.completionPercentage || 0)}%</div>
                  <div>Completed</div>
                </div>
              </div>

              ${challenge.streakCount && challenge.streakCount > 0 ? `
                <div class="tips">
                  <h4>🔥 You're on fire!</h4>
                  <p>You've maintained your streak for <strong>${challenge.streakCount} day(s)</strong>! Don't let this momentum go to waste. Every upload gets you closer to your goal.</p>
                </div>
              ` : `
                <div class="tips">
                  <h4>💪 Get Back on Track</h4>
                  <p>Every creator faces challenges. The key is consistency and not giving up. Upload today and start building that streak!</p>
                </div>
              `}

              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge" class="cta-button">
                  Upload & Track Progress
                </a>
              </div>

              <p>Remember: The goal isn't perfection, it's consistency. Every upload matters, and your audience is waiting to see what you create next!</p>
            </div>

            <div class="footer">
              <p>You've got this! 💪</p>
              <p>The YT-AI Team</p>
              <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings">Manage Notifications</a> | <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge">Dashboard</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"YT-AI Challenges" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `${urgencyEmoji} ${urgency === 'urgent' ? 'URGENT: ' : ''}Your upload is due ${timeUntilDeadline || 'soon'}!`,
      html: htmlContent
    })

    console.log(`Reminder email sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending reminder email:', error)
    throw error
  }
}

// Streak Achievement Email
export async function sendStreakAchievementEmail(context: ChallengeEmailContext) {
  try {
    const { userEmail, userName, challenge, streakCount } = context
    const milestones = [7, 14, 30, 60, 90]
    const currentMilestone = milestones.find(m => m === streakCount)
    
    if (!currentMilestone) return // Only send for specific milestones

    const getMilestoneEmoji = (streak: number) => {
      if (streak >= 90) return '🏆'
      if (streak >= 60) return '💎'
      if (streak >= 30) return '🥇'
      if (streak >= 14) return '🥈'
      return '🥉'
    }

    const getMilestoneTitle = (streak: number) => {
      if (streak >= 90) return 'Legend'
      if (streak >= 60) return 'Master'
      if (streak >= 30) return 'Champion'
      if (streak >= 14) return 'Warrior'
      return 'Achiever'
    }

    const emoji = getMilestoneEmoji(currentMilestone)
    const title = getMilestoneTitle(currentMilestone)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 40px; text-align: center; }
            .content { padding: 30px; }
            .achievement-box { background: #fef3c7; border: 2px solid #fbbf24; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
            .streak-number { font-size: 48px; font-weight: bold; color: #f59e0b; margin: 20px 0; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .cta-button { background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .motivational { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${emoji} Achievement Unlocked!</h1>
              <h2>${currentMilestone}-Day Streak ${title}</h2>
              <p>Outstanding consistency, ${userName}!</p>
            </div>
            
            <div class="content">
              <div class="achievement-box">
                <div style="font-size: 64px; margin-bottom: 20px;">${emoji}</div>
                <h2>${title} Status Achieved!</h2>
                <div class="streak-number">${currentMilestone} Days</div>
                <p>You've maintained your upload streak for <strong>${currentMilestone} consecutive days</strong>!</p>
              </div>

              <p>Hi ${userName},</p>
              <p>We're absolutely thrilled to celebrate this incredible milestone with you! Reaching a ${currentMilestone}-day streak is no small feat – it shows true dedication and commitment to your YouTube journey.</p>

              <h3>📊 Your Amazing Stats:</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${challenge.uploads?.length || 0}</div>
                  <div>Total Videos</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${challenge.pointsEarned || 0}</div>
                  <div>Points Earned</div>
                </div>
              </div>

              <div class="motivational">
                <h4>🌟 What this achievement means:</h4>
                <ul>
                  <li><strong>Discipline:</strong> You've shown incredible self-discipline</li>
                  <li><strong>Growth:</strong> Your audience has been consistently engaged</li>
                  <li><strong>Momentum:</strong> You're building unstoppable momentum</li>
                  <li><strong>Inspiration:</strong> You're inspiring other creators to be consistent</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge" class="cta-button">
                  Keep the Streak Going!
                </a>
              </div>

              <p>The best part? You're just getting started! Each day you maintain this streak, you're not just creating content – you're building a brand, growing an audience, and developing the habits that separate successful creators from the rest.</p>
              
              <p>Keep up the fantastic work, and let's see how far you can take this streak! 🚀</p>
            </div>

            <div class="footer">
              <p>Congratulations again on this amazing achievement! 🎉</p>
              <p>The YT-AI Team</p>
              <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge">View Your Progress</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"YT-AI Challenges" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `🎉 ${emoji} Achievement Unlocked: ${currentMilestone}-Day Streak ${title}!`,
      html: htmlContent
    })

    console.log(`Streak achievement email sent to ${userEmail} for ${currentMilestone} days`)
  } catch (error) {
    console.error('Error sending streak achievement email:', error)
    throw error
  }
}

// Missed Upload Alert Email
export async function sendMissedUploadEmail(context: ChallengeEmailContext) {
  try {
    const { userEmail, userName, challenge } = context

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #f97316; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .missed-box { background: #fef2f2; border: 2px solid #f87171; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .encouragement { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
            .cta-button { background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .tips { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Missed Upload Alert</h1>
              <h2>${challenge.challengeTitle}</h2>
              <p>Let's get back on track, ${userName}</p>
            </div>
            
            <div class="content">
              <div class="missed-box">
                <h3>📅 You missed your scheduled upload</h3>
                <p>Don't worry – every creator faces setbacks. What matters is getting back on track!</p>
              </div>

              <p>Hi ${userName},</p>
              <p>We noticed you missed your scheduled upload for the <strong>${challenge.challengeTitle}</strong>. First, don't be too hard on yourself – consistency is a journey, not a destination.</p>

              <div class="encouragement">
                <h4>💪 Remember why you started:</h4>
                <p>You committed to this challenge because you believe in the power of consistency. One missed day doesn't define your journey – how you respond does.</p>
              </div>

              <div class="tips">
                <h4>🚀 Quick Recovery Tips:</h4>
                <ul>
                  <li><strong>Upload today:</strong> Get back on track immediately</li>
                  <li><strong>Prepare ahead:</strong> Have backup content ready</li>
                  <li><strong>Set reminders:</strong> Use phone alerts for upload times</li>
                  <li><strong>Lower the bar:</strong> Even a short video counts</li>
                  <li><strong>Focus on progress:</strong> Look how far you've already come</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge" class="cta-button">
                  Get Back on Track
                </a>
              </div>

              <p>The most successful creators aren't those who never miss a day – they're the ones who get back up quickly when they do. Your next upload is an opportunity to rebuild that momentum.</p>
              
              <p>We believe in you, and we're here to support your journey! 💙</p>
            </div>

            <div class="footer">
              <p>Don't give up – you've got this! 💪</p>
              <p>The YT-AI Team</p>
              <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge">Return to Dashboard</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"YT-AI Challenges" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `⚠️ Don't give up! Get back on track with ${challenge.challengeTitle}`,
      html: htmlContent
    })

    console.log(`Missed upload email sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending missed upload email:', error)
    throw error
  }
}

// Challenge Completion Email
export async function sendChallengeCompletionEmail(context: ChallengeEmailContext) {
  try {
    const { userEmail, userName, challenge, pointsEarned, missedDays } = context
    const isPerfect = (missedDays || 0) === 0
    const completionEmoji = isPerfect ? '🏆' : '🎉'
    const completionTitle = isPerfect ? 'PERFECT COMPLETION' : 'CHALLENGE COMPLETED'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; }
            .content { padding: 30px; }
            .completion-box { background: ${isPerfect ? '#fef3c7' : '#dcfce7'}; border: 2px solid ${isPerfect ? '#f59e0b' : '#22c55e'}; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 30px 0; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 5px; }
            .achievement-list { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .cta-button { background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .next-challenge { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${completionEmoji} ${completionTitle}!</h1>
              <h2>${challenge.challengeTitle}</h2>
              <p>Incredible work, ${userName}!</p>
            </div>
            
            <div class="content">
              <div class="completion-box">
                <div style="font-size: 64px; margin-bottom: 20px;">${completionEmoji}</div>
                <h2>${isPerfect ? 'PERFECT SCORE!' : 'Challenge Complete!'}</h2>
                <p>You've successfully completed your <strong>${challenge.challengeTitle}</strong>${isPerfect ? ' without missing a single day!' : '!'}</p>
              </div>

              <p>Hi ${userName},</p>
              <p>Congratulations! You've just accomplished something that many creators dream of but few achieve – completing a full consistency challenge. This is a testament to your dedication, discipline, and commitment to your YouTube growth.</p>

              <h3>📊 Your Final Results:</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${challenge.uploads?.length || 0}</div>
                  <div>Videos Created</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${challenge.longestStreak || 0}</div>
                  <div>Longest Streak</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${pointsEarned || challenge.pointsEarned || 0}</div>
                  <div>Total Points</div>
                </div>
              </div>

              <div class="achievement-list">
                <h4>🏅 What you've achieved:</h4>
                <ul>
                  <li><strong>Consistency:</strong> Built the habit of regular content creation</li>
                  <li><strong>Growth:</strong> Provided value to your audience consistently</li>
                  <li><strong>Discipline:</strong> Showed up even when you didn't feel like it</li>
                  <li><strong>Progress:</strong> Made significant strides in your YouTube journey</li>
                  ${isPerfect ? '<li><strong>Perfection:</strong> Achieved a flawless completion record</li>' : ''}
                </ul>
              </div>

              <div class="next-challenge">
                <h4>🚀 Ready for your next challenge?</h4>
                <p>You've proven you have what it takes to be consistent. Why not level up with a more ambitious challenge? Your audience is waiting to see what you create next!</p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge" class="cta-button">
                  Start Your Next Challenge
                </a>
              </div>

              <p>Your journey as a consistent creator is just beginning. Use the momentum you've built to continue growing your channel and serving your audience. You've got this! 🌟</p>
            </div>

            <div class="footer">
              <p>We're incredibly proud of your achievement! 🎊</p>
              <p>The YT-AI Team</p>
              <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge">View Your Stats</a> | <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/challenge">Start New Challenge</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"YT-AI Challenges" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `${completionEmoji} ${completionTitle}: ${challenge.challengeTitle}!`,
      html: htmlContent
    })

    console.log(`Challenge completion email sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending completion email:', error)
    throw error
  }
}